import React from 'react';
import { Row, Col } from 'antd';
import agent from 'utils/agent';
import slugify from 'slug';
import isEmpty from 'lodash/isEmpty';
import { dispatch } from 'stores';
import { connect } from 'react-redux';
import { NOW, CURRENT_DATE, CURRENT_TIME } from 'utils/time';
import { getEvent } from 'utils/event';
import { getCurrentUser } from 'utils/user';
import Author from 'components/DashboardComponents/Author';
import Category from 'components/DashboardComponents/Category';
import Tag from 'components/DashboardComponents/Tag';
import Permalink from 'components/DashboardComponents/Permalink';
import Publish from 'components/DashboardComponents/Publish';
import VisibilityOption from 'components/DashboardComponents/Publish/VisibilityOption';
import Toggle from 'components/DashboardComponents/Publish/Toggle';
import WordCount from 'components/DashboardComponents/WordCount';
import Appendix from 'components/DashboardComponents/Appendix';
import Title from 'components/DashboardComponents/Title';
import { first } from 'lodash';
import { Input, Collapse, DatePicker, TimePicker, notification, Select } from 'antd';
import moment from 'moment';

const Panel = Collapse.Panel;
const { TextArea } = Input;
const Option = Select.Option;

@connect(state => ({
  userInfo: state.app.userInfo,
}))
class EditOrAddNewVideo extends React.Component {
  constructor(props) {
    super(props);
    this.INITIAL_STATE = {
      id: '',
      title: '',
      slug: '',
      description: '',
      password: '',
      categories: [],
      categoriesId: [],
      selectedTags: [],
      embedded: '',
      status: 'draft',
      visibility: 'public',
      saveText: 'Save Draft',
      statusDescription: 'Draft',
      visibilityDescription: 'Public',
      scheduleTitle: 'Publish',
      scheduleDescription: 'Immediately',
      date: CURRENT_DATE,
      time: CURRENT_TIME,
      scheduleText: '',
      statusDisableEdit: false,
      createdAt: 0,
    };

    this.state = this.INITIAL_STATE;

    this.handleChange = this.handleChange.bind(this);
    this.handleBlurTitle = this.handleBlurTitle.bind(this);
    this.handleClickSave = this.handleClickSave.bind(this);
    this.handleClickPreview = this.handleClickPreview.bind(this);
    this.handleClickSubmit = this.handleClickSubmit.bind(this);
    this.handleClickOkStatus = this.handleClickOkStatus.bind(this);
    this.handleClickOkVisibility = this.handleClickOkVisibility.bind(this);
    this.handleClickOkSchedule = this.handleClickOkSchedule.bind(this);
    this.handleClickOkPermalink = this.handleClickOkPermalink.bind(this);
    this.autoSaveDraft = this.autoSaveDraft.bind(this);
  }

  async componentDidUpdate(prevProps) {
    // Reset state if page is add new
    if (prevProps.match.params.id !== this.props.match.params.id) {
      // Reset state
      this.setState(this.INITIAL_STATE, async () => {
        await this.fetchAllItems();
      });
    }
  }

  async componentDidMount() {
    await this.lockVideo();
    await this.fetchAllItems();
    this.intervalId = setInterval(async () => await this.autoSaveDraft(), 9000);
  }

  componentWillUnmount() {
    clearInterval(this.intervalId);
  }

  async lockVideo() {
    const { id } = this.state;
    const videoId = this.props.match.params.id;
    const currentId = isEmpty(id) ? videoId : id;

    // Only lock when id not empty
    if (isEmpty(currentId)) {
      return false;
    }

    try {
      const userId = this.props.userInfo.id;
      await agent.post(`/videos/lock/${currentId}`).send({ userId });
    } catch (e) {
      notification.open({
        type: 'error',
        message: 'Error',
        description: 'Can not lock this Video',
      });
    }
  }

  async autoSaveDraft() {
    const { id } = this.state;
    const videoId = this.props.match.params.id;
    const currentId = isEmpty(id) ? videoId : id;

    // Only save when id not empty
    if (isEmpty(currentId)) {
      return false;
    }

    await this.createOrUpdateVideo();
  }

  async fetchAllItems() {
    const id = this.props.match.params.id;

    // Check page is empty or not
    if (isEmpty(id)) {
      return false;
    }

    let title = '';
    let slug = '';
    let description = '';
    let embedded = '';
    let selectedTags = [];
    let categoriesId = [];
    let userId = '';
    let status = 'publish';
    let password = '';
    let visibility = 'public';
    let date = CURRENT_DATE;
    let time = CURRENT_TIME;
    let createdAt = 0;

    // Fetch Video by id
    try {
      let response = await agent.get(`/videos/${id}`).query({
        populate: 'categories,tags',
      });
      let body = response.body;
      let scheduleDate = moment(body.scheduleDate);
      title = body.title;
      slug = body.slug;
      description = body.description;
      embedded = body.embedded;
      password = body.password;
      selectedTags = body.tags;
      selectedTags = selectedTags.map(tag => ({ key: tag.id, label: tag.name }));
      categoriesId = body.categories.map(category => category.id);
      userId = body.user;
      status = body.status;
      createdAt = body.createdAt;

      // Check schedule date is valid or not
      if (body.scheduleDate !== 0) {
        date = scheduleDate;
        time = scheduleDate;
      }

      // Get visibility based on password, status
      if (!isEmpty(password)) {
        visibility = 'password';
      } else if (status === 'private') {
        visibility = 'private';
      } else {
        visibility = 'public';
      }
    } catch (e) {
      notification.open({
        type: 'error',
        message: 'Error',
        description: 'Can not get Video',
      });
    }

    this.setState(
      {
        title: title,
        slug: slug,
        password: password,
        description: description,
        embedded: embedded,
        selectedTags: selectedTags,
        categoriesId: categoriesId,
        userId: userId,
        status: status,
        createdAt: createdAt,
        date: date,
        time: time,
        visibility: visibility,
      },
      async () => {
        await this.handleClickOkStatus();
        await this.handleClickOkVisibility();
        await this.handleClickOkSchedule();
      },
    );
  }

  handleChange(event) {
    this.setState({
      [event.target.name]: event.target.value,
    });
  }

  handleBlurTitle() {
    const { id, title } = this.state;
    const videoId = this.props.match.params.id;
    const slug = slugify(title, { lower: true });

    let data = {
      slug: slug,
    };

    // Not allow to have empty title
    if (isEmpty(title)) {
      return false;
    }

    // Not create new Video if id is exist
    if (!isEmpty(videoId)) {
      return false;
    }

    // Not update slug if Video id is exist;
    if (!isEmpty(id)) {
      return false;
    }

    this.setState(data, async () => {
      try {
        const response = await this.createOrUpdateVideo();
        const { id, slug } = response.body;

        if (slug !== data.slug) {
          notification.open({
            type: 'warning',
            message: 'Warning',
            description:
              'The slug have already existed, the system will generate unique slug with id',
          });
        }

        this.setState({ id, slug });
      } catch (e) {
        notification.open({
          type: 'error',
          message: 'Error',
          description: 'Can not generate slug',
        });
      }
    });
  }

  async handleClickSave() {
    const { status, title } = this.state;

    if (isEmpty(title)) {
      notification.open({
        type: 'error',
        message: 'Error',
        description: 'Title is required',
      });

      return false;
    }

    this.setState({ status }, async () => {
      try {
        await this.createOrUpdateVideo();
        notification.open({
          type: 'success',
          message: 'Success',
          description: 'Save successfully',
        });
      } catch (e) {
        notification.open({
          type: 'error',
          message: 'Error',
          description: 'Can not submit Video',
        });
      }
    });
  }

  async handleClickPreview() {
    const { title, slug } = this.state;

    if (isEmpty(title)) {
      notification.open({
        type: 'error',
        message: 'Error',
        description: 'Title is required',
      });

      return false;
    }

    try {
      await this.createOrUpdateVideo();
      let previewUrl = `/video/preview/${slug}`;
      window.open(process.env.REACT_APP_WEB_URL + previewUrl);
    } catch (e) {
      notification.open({
        type: 'error',
        message: 'Error',
        description: 'Can not preview Video',
      });
    }
  }

  async handleClickSubmit() {
    const { title, selectedTags, status, scheduleText } = this.state;

    if (isEmpty(title)) {
      notification.open({
        type: 'error',
        message: 'Error',
        description: 'Title is required',
      });

      return false;
    }

    if (isEmpty(selectedTags)) {
      notification.open({
        type: 'error',
        message: 'Error',
        description: 'Tags is required',
      });

      return false;
    }

    let currentStatus = 'publish';
    if (status === 'private') {
      currentStatus = 'private';
    }

    const videoId = this.props.match.params.id;

    let alertMessage;
    if (!isEmpty(videoId)) {
      alertMessage = 'Video updated';
    } else if (!isEmpty(scheduleText)) {
      alertMessage = 'Video scheduled';
    } else {
      alertMessage = 'Video published';
    }

    this.setState({ status: currentStatus }, async () => {
      try {
        await this.createOrUpdateVideo();
        notification.open({
          type: 'success',
          message: 'Success',
          description: alertMessage,
        });
      } catch (e) {
        notification.open({
          type: 'error',
          message: 'Error',
          description: 'Can not submit Video',
        });
      }

      // Refresh featured general Video
      await agent.put('/settings/featured-general/refresh');
    });
  }

  async createOrFindTags(tags) {
    let emptyTags = tags.filter(tag => tag.key.indexOf('empty-') > -1);
    let selectedTags = tags.filter(tag => tag.key.indexOf('empty-') <= -1);

    await Promise.all(
      emptyTags.map(async emptyTag => {
        let params = {
          name: emptyTag.label,
          slug: slugify(emptyTag.label, { lower: true }),
        };

        try {
          let response = await agent.post('/video_tags/findOrCreate').send(params);
          let tag = response.body;
          selectedTags.push({ key: tag.id, label: tag.name });
        } catch (e) {
          notification.open({
            type: 'error',
            message: 'Error',
            description: 'Can not add new tag into system',
          });
        }
      }),
    );

    return selectedTags;
  }

  async createOrUpdateVideo() {
    const {
      id,
      title,
      slug,
      description,
      password,
      categoriesId,
      selectedTags,
      embedded,
      status,
      userId,
      visibility,
      date,
      time,
    } = this.state;

    const videoId = this.props.match.params.id;
    let currentUserId = this.props.userInfo.id;
    let tagsId = await this.createOrFindTags(selectedTags);
    tagsId = tagsId.map(tag => tag.key);
    let currentPassword = '';

    // Only save password when visibility select password
    if (visibility === 'password') {
      currentPassword = password;
    }

    // Only save scheduleDate when date and time is not same as now
    let scheduleDate = 0;
    if (!(date.isSame(NOW) && time.isSame(NOW))) {
      let currentDate = date.format('YYYY-MM-DD');
      let currentTime = time.format('HH:mm:ss');
      let currentDateTime = currentDate + ' ' + currentTime;
      scheduleDate = moment(currentDateTime, 'YYYY-MM-DD HH:mm:ss').valueOf();
    }

    let params = {
      title: title,
      slug: slug,
      description: description,
      password: currentPassword,
      scheduleDate: scheduleDate,
      embedded: embedded,
      user: isEmpty(userId) ? currentUserId : userId,
      categoriesId: categoriesId,
      tagsId: tagsId,
      status: status,
    };

    let response;

    // Create a new Video
    if (isEmpty(id) && isEmpty(videoId)) {
      response = await agent.post(`/videos`).send(params);
    }

    // Update data for an exist Video
    if (!isEmpty(id) || !isEmpty(videoId)) {
      let itemId = isEmpty(id) ? videoId : id;
      response = await agent.put(`/videos/${itemId}`).send(params);
    }

    return response;
  }

  async handleClickOkStatus() {
    let { status, saveText, statusDescription } = this.state;

    switch (status) {
      case 'pending':
        saveText = 'Save As Pending';
        statusDescription = 'Pending Preview';
        break;
      case 'draft':
        saveText = 'Save Draft';
        statusDescription = 'Draft';
        break;
      case 'publish':
        saveText = '';
        statusDescription = 'Published';
        break;
      default:
        break;
    }

    this.setState({
      saveText,
      statusDescription,
    });
  }

  async handleClickOkVisibility() {
    let {
      status,
      visibility,
      saveText,
      statusDescription,
      visibilityDescription,
      statusDisableEdit,
    } = this.state;

    // Check that visibility is private or not
    // then recover to normal status
    if (statusDisableEdit) {
      saveText = 'Save Draft';
      statusDescription = 'Draft';
      statusDisableEdit = false;
    }

    // Switch
    switch (visibility) {
      case 'public':
        visibilityDescription = 'Public';
        break;
      case 'password':
        visibilityDescription = 'Password Protected';
        break;
      case 'private':
        saveText = '';
        status = 'private';
        statusDescription = 'Privately Published';
        statusDisableEdit = true;
        visibilityDescription = 'Private';
        break;
      default:
        break;
    }

    this.setState({
      status,
      saveText,
      statusDescription,
      statusDisableEdit,
      visibilityDescription,
    });
  }

  async handleClickOkSchedule() {
    let { date, time, scheduleTitle, scheduleDescription, scheduleText, createdAt } = this.state;
    const id = this.props.match.params.id;
    const created = moment(createdAt);

    if (date.isSame(NOW) && time.isSame(NOW)) {
      if (isEmpty(id)) {
        scheduleTitle = 'Publish';
        scheduleDescription = 'Immediately';
      } else {
        scheduleTitle = 'Published on';
        scheduleDescription = created.format('MMM, DD YYYY @ HH:mm');
      }
    } else {
      scheduleTitle = 'Schedule for';
      scheduleDescription = date.format('MMM, DD YYYY') + ' @ ' + time.format('HH:mm');
      scheduleText = 'Schedule';
    }

    this.setState({
      scheduleTitle,
      scheduleDescription,
      scheduleText,
    });
  }

  async handleClickOkPermalink() {
    const { id } = this.state;
    const slug = slugify(this.state.slug, { lower: true });
    const videoId = this.props.match.params.id;
    const itemId = isEmpty(id) ? videoId : id;

    try {
      const response = await agent.put(`/videos/${itemId}/slug/${slug}`);
      const video = first(response.body);

      if (slug !== video.slug) {
        notification.open({
          type: 'warning',
          message: 'Warning',
          description:
            'The slug have already existed, the system will generate unique slug with id',
        });
      }

      this.setState({ slug: video.slug });
    } catch (e) {
      notification.open({
        type: 'error',
        message: 'Error',
        description: 'Can not update permalink',
      });
    }
  }

  render() {
    const {
      title,
      slug,
      description,
      categoriesId,
      password,
      selectedTags,
      userId,
      status,
      date,
      time,
      saveText,
      statusDescription,
      visibilityDescription,
      scheduleTitle,
      scheduleDescription,
      statusDisableEdit,
      scheduleText,
      embedded,
    } = this.state;
    const { userInfo } = this.props;
    const id = this.props.match.params.id;
    const user = getCurrentUser({ userId, userInfo });

    // Get submit text for button
    let submitText;
    if (isEmpty(id)) {
      if (isEmpty(scheduleText)) {
        submitText = 'Publish';
      } else {
        submitText = 'Schedule';
      }
    } else {
      if (status === 'draft') {
        submitText = 'Publish';
      } else {
        submitText = 'Update';
      }
    }

    return (
      <Row>
        <Title>{isEmpty(id) ? 'Add New Video' : 'Edit Video'}</Title>
        <Col xs={24} md={16}>
          <Col xs={24} md={23}>
            <Row>
              <Input
                name="title"
                size="large"
                placeholder="Enter title here"
                value={title}
                onChange={this.handleChange}
                onBlur={this.handleBlurTitle}
              />
              <WordCount
                help="Recommended Title: 60 characters, Character Count: "
                max={60}
                word={title}
              />
            </Row>
            <Permalink
              name="slug"
              type="video"
              value={slug}
              onChange={this.handleChange}
              onOk={this.handleClickOkPermalink}
            />
            <br />
            <Row>
              <Appendix>Description</Appendix>
              <TextArea
                rows={16}
                name="description"
                onChange={this.handleChange}
                value={description}
              />
            </Row>
          </Col>
        </Col>
        <Col xs={24} md={8}>
          <Collapse defaultActiveKey={['1']}>
            <Panel header="Publish" key="1">
              <Publish
                saveText={saveText}
                submitText={submitText}
                onSave={this.handleClickSave}
                onPreview={this.handleClickPreview}
                onSubmit={this.handleClickSubmit}
              >
                <Toggle
                  title="Status"
                  description={statusDescription}
                  icon="fa fa-map-pin"
                  disableEdit={statusDisableEdit}
                  onOk={this.handleClickOkStatus}
                >
                  <Select
                    style={{ width: 140 }}
                    defaultValue="draft"
                    value={status}
                    onChange={value => this.handleChange(getEvent('status', value))}
                  >
                    <Option value="pending">Pending Review</Option>
                    <Option value="draft">Draft</Option>
                    <Option value="publish">Published</Option>
                  </Select>
                </Toggle>
                <Toggle
                  title="Visibility"
                  description={visibilityDescription}
                  icon="fa fa-calendar"
                  onOk={this.handleClickOkVisibility}
                >
                  <VisibilityOption
                    password={password}
                    onPassword={this.handleChange}
                    onChange={this.handleChange}
                  />
                </Toggle>
                <Toggle
                  title={scheduleTitle}
                  description={scheduleDescription}
                  icon="fa fa-eye"
                  onOk={this.handleClickOkSchedule}
                >
                  <Row>
                    <Col md={11} className="mr-2">
                      <DatePicker
                        allowClear={false}
                        value={date}
                        onChange={date => this.handleChange(getEvent('date', date))}
                      />
                    </Col>
                    <Col md={12}>
                      <TimePicker
                        value={time}
                        format="HH:mm"
                        onChange={time => this.handleChange(getEvent('time', time))}
                      />
                    </Col>
                  </Row>
                </Toggle>
              </Publish>
            </Panel>
          </Collapse>
          <br />
          <Collapse defaultActiveKey={['1']}>
            <Panel header="Author" key="1">
              <Author name="userId" onChange={this.handleChange} value={user} />
            </Panel>
          </Collapse>
          <br />
          <Collapse defaultActiveKey={['1']}>
            <Panel header="Embedded" key="1">
              <Input
                name="embedded"
                placeholder="Video Link"
                value={embedded}
                onChange={this.handleChange}
              />
            </Panel>
          </Collapse>
          <br />
          <Collapse defaultActiveKey={['1']}>
            <Panel header="Categories" key="1">
              <Category
                endpoint="/video_categories"
                name="categoriesId"
                value={categoriesId}
                onChange={this.handleChange}
              />
            </Panel>
          </Collapse>
          <br />
          <Collapse defaultActiveKey={['1']}>
            <Panel header="Tags" key="1">
              <Tag
                endpoint="/video_tags"
                name="selectedTags"
                value={selectedTags}
                onChange={this.handleChange}
              />
            </Panel>
          </Collapse>
        </Col>
      </Row>
    );
  }
}

export default EditOrAddNewVideo;
