import React from 'react';
import { Row, Col } from 'antd';
import agent from 'utils/agent';
import slugify from 'slug';
import isEmpty from 'lodash/isEmpty';
import { dispatch } from 'stores';
import find from 'lodash/find';
import get from 'lodash/get';
import cn from 'classnames';
import { connect } from 'react-redux';
import { NOW, CURRENT_DATE, CURRENT_TIME } from 'utils/time';
import { getEvent } from 'utils/event';
import { getCurrentUser } from 'utils/user';
import FroalaWysiwygEditor from 'components/DashboardComponents/FroalaWysiwygEditor';
import Author from 'components/DashboardComponents/Author';
import Format from 'components/DashboardComponents/Format';
import Category from 'components/DashboardComponents/Category';
import Tag from 'components/DashboardComponents/Tag';
import FeaturedImage from 'components/DashboardComponents/FeaturedImage';
import Permalink from 'components/DashboardComponents/Permalink';
import Publish from 'components/DashboardComponents/Publish';
import VisibilityOption from 'components/DashboardComponents/Publish/VisibilityOption';
import Toggle from 'components/DashboardComponents/Publish/Toggle';
import WordCount from 'components/DashboardComponents/WordCount';
import Appendix from 'components/DashboardComponents/Appendix';
import Title from 'components/DashboardComponents/Title';
import Attachment from 'components/DashboardComponents/Attachment';
import { first } from 'lodash';
import { Input, Collapse, DatePicker, TimePicker, notification, Modal, Select } from 'antd';
import moment from 'moment';

const Panel = Collapse.Panel;
const { TextArea } = Input;
const Option = Select.Option;
const { confirm } = Modal;

@connect(state => ({
  userInfo: state.app.userInfo,
}))
class EditOrAddNewPost extends React.Component {
  constructor(props) {
    super(props);
    this.INITIAL_STATE = {
      id: '',
      title: '',
      summary: '',
      password: '',
      firstKeyPoint: '',
      secondKeyPoint: '',
      thirdKeyPoint: '',
      categories: [],
      slug: '',
      permalink: '',
      content: '',
      categoriesId: [],
      selectedTags: [],
      formatId: '',
      thumbnailCaption: '',
      thumbnail: {},
      attachments: [],
      embedded: '',
      status: 'draft',
      visibility: 'public',
      date: CURRENT_DATE,
      time: CURRENT_TIME,
      formats: [],
      saveText: 'Save Draft',
      statusDescription: 'Draft',
      visibilityDescription: 'Public',
      scheduleTitle: 'Publish',
      scheduleDescription: 'Immediately',
      scheduleText: '',
      statusDisableEdit: false,
      createdAt: 0,
      publishAt: 0,
      postParams: {
        populate: 'categories,tags,thumbnail,format,attachments',
      },
    };

    this.state = this.INITIAL_STATE;

    this.handleChange = this.handleChange.bind(this);
    this.handleBlurTitle = this.handleBlurTitle.bind(this);
    this.handleChangeContent = this.handleChangeContent.bind(this);
    this.handleChangeUploadThumbnail = this.handleChangeUploadThumbnail.bind(this);
    this.handleClickRemoveThumbnail = this.handleClickRemoveThumbnail.bind(this);
    this.handleClickSave = this.handleClickSave.bind(this);
    this.handleClickPreview = this.handleClickPreview.bind(this);
    this.handleClickSubmit = this.handleClickSubmit.bind(this);
    this.handleClickOkStatus = this.handleClickOkStatus.bind(this);
    this.handleClickOkVisibility = this.handleClickOkVisibility.bind(this);
    this.handleClickOkSchedule = this.handleClickOkSchedule.bind(this);
    this.handleClickOkPermalink = this.handleClickOkPermalink.bind(this);
    this.handleResultFormat = this.handleResultFormat.bind(this);
    this.handleChangeEmbedded = this.handleChangeEmbedded.bind(this);
    this.handleChangeAttachment = this.handleChangeAttachment.bind(this);
    this.showConfirm = this.showConfirm.bind(this);
    this.autoSaveDraft = this.autoSaveDraft.bind(this);
  }

  async componentDidUpdate(prevProps) {
    // Reset state if page is add new
    if (prevProps.match.params.id !== this.props.match.params.id) {
      // NOT RESET FORMATS AND FORMAT ID,
      // CANT NOT SAVE POST WITHOUT THESE
      const { formatId, formats } = this.state;
      this.INITIAL_STATE.formatId = formatId;
      this.INITIAL_STATE.formats = formats;

      // Reset state
      this.setState(this.INITIAL_STATE, async () => {
        await this.fetchAllItems();
      });
    }
  }

  async componentDidMount() {
    await this.lockPost();
    await this.fetchAllItems();
    this.intervalId = setInterval(async () => await this.autoSaveDraft(), 9000);
  }

  componentWillUnmount() {
    clearInterval(this.intervalId);
  }

  async lockPost() {
    const { id } = this.state;
    const postId = this.props.match.params.id;
    const currentId = isEmpty(id) ? postId : id;

    // Only lock when id not empty
    if (isEmpty(currentId)) {
      return false;
    }

    try {
      const userId = this.props.userInfo.id;
      await agent.post(`/posts/lock/${currentId}`).send({ userId });
    } catch (e) {
      notification.open({
        type: 'error',
        message: 'Error',
        description: 'Can not lock this post',
      });
    }
  }

  async autoSaveDraft() {
    const { id } = this.state;
    const postId = this.props.match.params.id;
    const currentId = isEmpty(id) ? postId : id;

    // Only save when id not empty
    if (isEmpty(currentId)) {
      return false;
    }

    await this.createOrUpdatePost();
  }

  async fetchAllItems() {
    const id = this.props.match.params.id;

    // Check page is empty or not
    if (isEmpty(id)) {
      return false;
    }

    let title = '';
    let slug = '';
    let summary = '';
    let firstKeyPoint = '';
    let secondKeyPoint = '';
    let thirdKeyPoint = '';
    let content = '';
    let thumbnailCaption = '';
    let embedded = '';
    let formatId = '';
    let thumbnail = {};
    let selectedTags = [];
    let categoriesId = [];
    let userId = '';
    let status = 'publish';
    let password = '';
    let visibility = 'public';
    let date = CURRENT_DATE;
    let time = CURRENT_TIME;
    let createdAt = 0;
    let attachments = [];
    const { postParams } = this.state;

    // Get permalink of the edit post
    let permalink = await this.getPermalink(id);

    // Fetch post by id
    try {
      let response = await agent.get(`/posts/${id}`).query(postParams);
      let body = response.body;
      let scheduleDate = moment(body.scheduleDate);
      title = body.title;
      slug = body.slug;
      password = body.password;
      summary = body.summary;
      firstKeyPoint = body.firstKeyPoint;
      secondKeyPoint = body.secondKeyPoint;
      thirdKeyPoint = body.thirdKeyPoint;
      content = body.content;
      selectedTags = body.tags;
      selectedTags = selectedTags.map(tag => ({ key: tag.id, label: tag.name }));
      categoriesId = body.categories.map(category => category.id);
      formatId = body.format.id;
      userId = body.user;
      attachments = body.attachments;
      thumbnailCaption = body.thumbnailCaption;
      embedded = body.embedded;
      thumbnail = isEmpty(body.thumbnail) ? {} : body.thumbnail;
      status = body.status;
      createdAt = body.createdAt;

      // Return to file list
      attachments = attachments.map(attachment => ({
        uid: attachment.id,
        name: attachment.name,
        url: attachment.link,
        status: 'done',
      }));

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
        description: 'Can not get post',
      });
    }

    this.setState(
      {
        title: title,
        slug: slug,
        permalink: permalink,
        password: password,
        summary: summary,
        firstKeyPoint: firstKeyPoint,
        secondKeyPoint: secondKeyPoint,
        thirdKeyPoint: thirdKeyPoint,
        content: content,
        thumbnailCaption: thumbnailCaption,
        embedded: embedded,
        thumbnail: thumbnail,
        selectedTags: selectedTags,
        categoriesId: categoriesId,
        userId: userId,
        formatId: formatId,
        attachments: attachments,
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

  async getPermalink(postId) {
    let permalink = null;
    try {
      let response = await agent.get(`/posts/${postId}/permalink`);
      permalink = response.body.permalink;
    } catch (e) {
      notification.open({
        type: 'error',
        message: 'Error',
        description: 'Can not get permalink',
      });
    }

    return permalink;
  }

  handleChange(event) {
    this.setState({
      [event.target.name]: event.target.value,
    });
  }

  handleBlurTitle() {
    const { id, title } = this.state;
    const postId = this.props.match.params.id;
    const slug = slugify(title, { lower: true });

    let data = {
      slug: slug,
    };

    // Not allow to have empty title
    if (isEmpty(title)) {
      return false;
    }

    // Not create new post if id is exist
    if (!isEmpty(postId)) {
      return false;
    }

    // Not update slug if post id is exist;
    if (!isEmpty(id)) {
      return false;
    }

    this.setState(data, async () => {
      try {
        const response = await this.createOrUpdatePost();
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

  handleChangeContent(content) {
    this.setState({
      content: content,
    });
  }

  handleChangeUploadThumbnail(info) {
    if (info.file.status === 'uploading') {
      this.setState({ loading: true });
    }

    if (info.file.status === 'done') {
      this.setState({
        thumbnail: {
          id: info.file.response.id,
          link: info.file.response.link,
        },
        loading: false,
      });
    }
  }

  handleClickRemoveThumbnail() {
    this.setState({
      thumbnail: {},
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
        await this.createOrUpdatePost();
        notification.open({
          type: 'success',
          message: 'Success',
          description: 'Save successfully',
        });
      } catch (e) {
        notification.open({
          type: 'error',
          message: 'Error',
          description: 'Can not submit post',
        });
      }
    });
  }

  async handleClickPreview() {
    const { title, id, permalink } = this.state;

    if (isEmpty(title)) {
      notification.open({
        type: 'error',
        message: 'Error',
        description: 'Title is required',
      });

      return false;
    }

    const postId = this.props.match.params.id;
    const itemId = isEmpty(id) ? postId : id;

    try {
      await this.createOrUpdatePost();
      let previewUrl = `/post/preview/${itemId}`;
      if (!isEmpty(permalink)) {
        previewUrl = await this.getPermalink(itemId);
        if (isEmpty(previewUrl)) {
          previewUrl = permalink;
        }
      }

      window.open(process.env.REACT_APP_WEB_URL + previewUrl);
    } catch (e) {
      notification.open({
        type: 'error',
        message: 'Error',
        description: 'Can not preview post',
      });
    }
  }

  async handleClickSubmit() {
    const { title, selectedTags, thumbnail, status, scheduleText } = this.state;

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

    if (isEmpty(thumbnail)) {
      notification.open({
        type: 'error',
        message: 'Error',
        description: 'Featured image is required',
      });

      return false;
    }

    let currentStatus = 'publish';
    if (status === 'private') {
      currentStatus = 'private';
    }

    const postId = this.props.match.params.id;

    let alertMessage;
    let publishAt = 0;
    if (!isEmpty(postId)) {
      alertMessage = 'Post updated';
    } else if (!isEmpty(scheduleText)) {
      alertMessage = 'Post scheduled';
    } else {
      alertMessage = 'Post published';
      publishAt = new Date().getTime();
    }

    this.setState(
      {
        status: currentStatus,
        publishAt: publishAt,
      },
      async () => {
        try {
          await this.createOrUpdatePost();
          notification.open({
            type: 'success',
            message: 'Success',
            description: alertMessage,
          });
        } catch (e) {
          notification.open({
            type: 'error',
            message: 'Error',
            description: 'Can not submit post',
          });
        }

        // Refresh featured general post
        await agent.put('/settings/featured-general/refresh');
      },
    );
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
          let response = await agent.post('/tags/findOrCreate').send(params);
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

  async createOrUpdatePost() {
    const {
      id,
      title,
      slug,
      summary,
      firstKeyPoint,
      secondKeyPoint,
      thirdKeyPoint,
      content,
      formatId,
      thumbnailCaption,
      thumbnail,
      password,
      categoriesId,
      selectedTags,
      attachments,
      embedded,
      status,
      userId,
      visibility,
      date,
      time,
      publishAt,
    } = this.state;

    const postId = this.props.match.params.id;
    let currentUserId = this.props.userInfo.id;
    let tagsId = await this.createOrFindTags(selectedTags);
    tagsId = tagsId.map(tag => tag.key);
    let attachmentsId = attachments.map(item => (item.response ? item.response.id : item.uid));
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
      summary: summary,
      firstKeyPoint: firstKeyPoint,
      secondKeyPoint: secondKeyPoint,
      thirdKeyPoint: thirdKeyPoint,
      content: content,
      password: currentPassword,
      scheduleDate: scheduleDate,
      thumbnailCaption: thumbnailCaption,
      embedded: embedded,
      userId: isEmpty(userId) ? currentUserId : userId,
      thumbnailId: thumbnail.id,
      formatId: formatId,
      categoriesId: categoriesId,
      tagsId: tagsId,
      attachmentsId: attachmentsId,
      status: status,
    };

    if (publishAt > 0) {
      params.createdAt = publishAt;
    }

    let response;

    // Create a new post
    if (isEmpty(id) && isEmpty(postId)) {
      response = await agent.post(`/posts`).send(params);
    }

    // Update data for an exist post
    if (!isEmpty(id) || !isEmpty(postId)) {
      let itemId = isEmpty(id) ? postId : id;
      response = await agent.put(`/posts/${itemId}`).send(params);
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
    const postId = this.props.match.params.id;
    const itemId = isEmpty(id) ? postId : id;

    try {
      const response = await agent.put(`/posts/${itemId}/slug/${slug}`);
      const post = first(response.body);

      if (slug !== post.slug) {
        notification.open({
          type: 'warning',
          message: 'Warning',
          description:
            'The slug have already existed, the system will generate unique slug with id',
        });
      }

      this.setState({ slug: post.slug });
    } catch (e) {
      notification.open({
        type: 'error',
        message: 'Error',
        description: 'Can not update permalink',
      });
    }
  }

  handleChangeEmbedded(event) {
    const { attachments } = this.state;

    // If there is no attachments and then show confirm
    if (!isEmpty(attachments)) {
      confirm({
        title: 'Do you want to delete these medias?',
        content: 'You will lose all uploads of attachments when you change to embedded',
        onOk: () => {
          this.setState({ attachments: [] });
        },
        onCancel: () => {
          this.setState({ embedded: '' });
        },
      });
    }

    this.setState({ embedded: event.target.value });
  }

  handleChangeAttachment({ file, fileList }) {
    const { formats, formatId } = this.state;
    const format = find(formats, { id: formatId });
    const formatType = get(format, 'name', 'standard');
    const singular = ['video', 'podcast'];

    // Limit to upload only one for video and podcast
    if (singular.includes(formatType)) {
      fileList = fileList.slice(-1);
    }

    // Only save file when this file have status
    if (file.status) {
      this.setState({
        attachments: fileList,
        embedded: '',
      });
    }
  }

  handleResultFormat(items) {
    const format = find(items, { name: 'standard' });
    const formatId = format.id;
    const formats = items;
    this.setState({ formatId, formats });
  }

  showConfirm() {
    confirm({
      title: 'Do you want to delete this media?',
      content: 'You will lose all uploads of attachments when you change to other option',
      onOk: () => {
        this.setState({ attachments: [] });
      },
      onCancel() {},
    });
  }

  render() {
    const {
      title,
      slug,
      permalink,
      summary,
      firstKeyPoint,
      secondKeyPoint,
      thirdKeyPoint,
      content,
      categoriesId,
      formatId,
      thumbnailCaption,
      thumbnail,
      password,
      selectedTags,
      userId,
      status,
      date,
      time,
      loading,
      saveText,
      statusDescription,
      visibilityDescription,
      scheduleTitle,
      scheduleDescription,
      statusDisableEdit,
      scheduleText,
      formats,
      attachments,
      embedded,
    } = this.state;
    const { userInfo } = this.props;
    const id = this.props.match.params.id;
    const user = getCurrentUser({ userId, userInfo });
    const format = find(formats, { id: formatId });
    const formatType = get(format, 'name', 'standard');
    const hide = formatType === 'standard';
    const hideEmbedded = formatType !== 'video';

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
        <Title>{isEmpty(id) ? 'Add New Post' : 'Edit Post'}</Title>
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
              value={slug}
              permalink={permalink}
              onChange={this.handleChange}
              onOk={this.handleClickOkPermalink}
            />
            <br />
            <Row>
              <Appendix>Summary</Appendix>
              <TextArea rows={4} name="summary" onChange={this.handleChange} value={summary} />
              <WordCount
                help="Recommended Summary: 120 to 158 characters, Character Count: "
                max={158}
                word={summary}
              />
            </Row>
            <br />
            <Row>
              <Appendix>Key Points</Appendix>
              <Input name="firstKeyPoint" value={firstKeyPoint} onChange={this.handleChange} />
            </Row>
            <br />
            <Row>
              <Input name="secondKeyPoint" value={secondKeyPoint} onChange={this.handleChange} />
            </Row>
            <br />
            <Row>
              <Input name="thirdKeyPoint" value={thirdKeyPoint} onChange={this.handleChange} />
            </Row>
            <Row className="mt-3">
              <Appendix>Content</Appendix>
              <FroalaWysiwygEditor model={content} onModelChange={this.handleChangeContent} />
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
            <Panel header="Format" key="1">
              <Format
                name="formatId"
                value={formatId}
                onChange={event => {
                  if (!isEmpty(attachments)) this.showConfirm();
                  this.handleChange(event);
                }}
                onResult={this.handleResultFormat}
              />
            </Panel>
          </Collapse>
          <br />
          <Collapse className={cn({ hide: hideEmbedded })} defaultActiveKey={['1']}>
            <Panel header="Embedded" key="1">
              <Input
                name="embedded"
                placeholder="Video Link"
                value={embedded}
                onChange={this.handleChangeEmbedded}
              />
            </Panel>
          </Collapse>
          <br />
          <Collapse className={cn({ hide })} defaultActiveKey={['1']}>
            <Panel header="Attachment" key="1">
              <Attachment
                action={process.env.REACT_APP_API_URL + '/medias'}
                name="media"
                type={formatType}
                fileList={attachments}
                onChange={this.handleChangeAttachment}
              />
            </Panel>
          </Collapse>
          <br />
          <Collapse defaultActiveKey={['1']}>
            <Panel header="Categories" key="1">
              <Category name="categoriesId" value={categoriesId} onChange={this.handleChange} />
            </Panel>
          </Collapse>
          <br />
          <Collapse defaultActiveKey={['1']}>
            <Panel header="Tags" key="1">
              <Tag name="selectedTags" value={selectedTags} onChange={this.handleChange} />
            </Panel>
          </Collapse>
          <br />
          <Collapse defaultActiveKey={['1']}>
            <Panel header="Featured Image Caption" key="1">
              <TextArea
                name="thumbnailCaption"
                value={thumbnailCaption}
                onChange={this.handleChange}
              />
            </Panel>
          </Collapse>
          <br />
          <Collapse defaultActiveKey={['1']}>
            <Panel header="Featured Image" key="1">
              <FeaturedImage
                name="media"
                loading={loading}
                value={thumbnail}
                action={process.env.REACT_APP_API_URL + '/medias'}
                onRemove={id => this.handleClickRemoveThumbnail(id)}
                onChange={this.handleChangeUploadThumbnail}
              />
            </Panel>
          </Collapse>
        </Col>
      </Row>
    );
  }
}

export default EditOrAddNewPost;
