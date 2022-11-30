import React from 'react';
import { getEvent } from 'utils/event';
import FroalaWysiwygEditor from 'components/DashboardComponents/FroalaWysiwygEditor';
import Toggle from 'components/DashboardComponents/Publish/Toggle';
import Publish from 'components/DashboardComponents/Publish';
import VisibilityOption from 'components/DashboardComponents/Publish/VisibilityOption';
import FeaturedImage from 'components/DashboardComponents/FeaturedImage';
import agent from 'utils/agent';
import slugify from 'slug';
import isEmpty from 'lodash/isEmpty';
import { dispatch } from 'stores';
import { connect } from 'react-redux';
import { NOW, CURRENT_TIME, CURRENT_DATE } from 'utils/time';
import {
  Input,
  Button,
  Collapse,
  TimePicker,
  DatePicker,
  Row,
  Col,
  Select,
  Checkbox,
  notification,
} from 'antd';
import moment from 'moment';

const { Option } = Select;
const Panel = Collapse.Panel;

@connect(state => ({
  userInfo: state.app.userInfo,
}))
class EditOrAddNewPage extends React.Component {
  constructor(props) {
    super(props);
    this.INITIAL_STATE = {
      pageId: '',
      title: '',
      slug: '',
      content: '',
      password: '',
      thumbnail: {},
      status: 'draft',
      scheduleDate: 0,
      date: CURRENT_DATE,
      time: CURRENT_TIME,
      statusState: false,
      visibleState: false,
      scheduleState: false,
      showInputPassword: false,
      editSlugState: false,
      loading: false,
      saveText: 'Save Draft',
      statusDescription: 'Draft',
      visibilityDescription: 'Public',
      scheduleTitle: 'Publish',
      scheduleDescription: 'Immediately',
      scheduleText: '',
      statusDisableEdit: false,
    };

    this.state = this.INITIAL_STATE;

    this.handleChange = this.handleChange.bind(this);
    this.handleBlurTitle = this.handleBlurTitle.bind(this);
    this.handleChangeContent = this.handleChangeContent.bind(this);
    this.handleChangeUploadThumbnail = this.handleChangeUploadThumbnail.bind(this);
    this.handleClickRemoveThumbnail = this.handleClickRemoveThumbnail.bind(this);
    this.handleChangeEditVisibility = this.handleChangeEditVisibility.bind(this);
    this.handleClickToggle = this.handleClickToggle.bind(this);
    this.handleClickOkStatus = this.handleClickOkStatus.bind(this);
    this.handleClickOkVisibility = this.handleClickOkVisibility.bind(this);
    this.handleClickOkSchedule = this.handleClickOkSchedule.bind(this);
    this.handleClickSave = this.handleClickSave.bind(this);
    this.handleClickPreview = this.handleClickPreview.bind(this);
    this.handleClickSubmit = this.handleClickSubmit.bind(this);
  }

  async componentDidUpdate(prevProps) {
    // Set state to default if page is add new
    if (prevProps.match.params.id !== this.props.match.params.id) {
      this.setState(this.INITIAL_STATE);
    }
  }

  async componentDidMount() {
    let id = this.props.match.params.id;

    // Check page is edit or not
    if (isEmpty(id)) {
      return false;
    }

    let title = '';
    let slug = '';
    let content = '';
    let thumbnail = {};
    let status = 'publish';

    try {
      let response = await agent.get(`/pages/${id}`);
      let body = response.body;
      title = body.title;
      slug = body.slug;
      content = body.content;
      thumbnail = isEmpty(body.thumbnail) ? {} : body.thumbnail;
      status = body.status;
    } catch (e) {
      notification.open({
        type: 'error',
        message: 'Error',
        description: 'Can not get page',
      });
    }

    this.setState({
      title,
      slug,
      content,
      thumbnail,
      status,
    });
  }

  handleChange(event) {
    this.setState({
      [event.target.name]: event.target.value,
    });
  }

  async handleBlurTitle() {
    const { id, title } = this.state;
    const pageId = this.props.match.params.id;
    const slug = slugify(title, { lower: true });

    let data = {
      slug: slug,
    };

    // Not allow to have empty title
    if (isEmpty(title)) {
      return false;
    }

    // Not create new post if id is exist
    if (!isEmpty(pageId)) {
      return false;
    }

    // Not update slug if post id is exist;
    if (!isEmpty(id)) {
      return false;
    }

    this.setState(data, async () => {
      try {
        const response = await this.createOrUpdatePage();
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
        console.log(e);
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
    const { title, status } = this.state;

    if (isEmpty(title)) {
      notification.open({
        type: 'error',
        message: 'Error',
        description: 'Title is required',
      });

      return false;
    }

    this.setState({ status: status }, async () => {
      try {
        await this.createOrUpdatePage();
        notification.open({
          type: 'success',
          message: 'Success',
          description: 'Save successfully',
        });
      } catch (e) {
        notification.open({
          type: 'error',
          message: 'Error',
          description: 'Can not save page',
        });
      }
    });
  }

  async handleClickPreview() {
    const { title, id } = this.state;

    if (isEmpty(title)) {
      notification.open({
        type: 'error',
        message: 'Error',
        description: 'Title is required',
      });

      return false;
    }

    const pageId = this.props.match.params.id;
    const itemId = isEmpty(id) ? pageId : id;

    try {
      await this.createOrUpdatePage();
      window.open(process.env.REACT_APP_WEB_URL + `/page/preview/${itemId}`);
    } catch (e) {
      notification.open({
        type: 'error',
        message: 'Error',
        description: 'Can not preview page',
      });
    }
  }

  async handleClickSubmit() {
    const { title, status, scheduleText } = this.state;

    if (isEmpty(title)) {
      notification.open({
        type: 'error',
        message: 'Error',
        description: 'Title is required',
      });

      return false;
    }

    let currentStatus = 'publish';
    if (status === 'private') {
      currentStatus = 'private';
    }

    const postId = this.props.match.params.id;

    let alertMessage;
    if (!isEmpty(postId)) {
      alertMessage = 'Post updated';
    } else if (!isEmpty(scheduleText)) {
      alertMessage = 'Post scheduled';
    } else {
      alertMessage = 'Post published';
    }

    this.setState({ status: currentStatus }, async () => {
      try {
        await this.createOrUpdatePage();
        notification.open({
          type: 'success',
          message: 'Success',
          description: alertMessage,
        });
      } catch (e) {
        notification.open({
          type: 'error',
          message: 'Error',
          description: 'Can not publish page',
        });
      }
    });
  }

  async createOrUpdatePage() {
    const { id, title, slug, content, thumbnail, status } = this.state;
    const pageId = this.props.match.params.id;
    const userId = this.props.userInfo.id;

    let params = {
      title: title,
      slug: slug,
      content: content,
      userId: userId,
      thumbnailId: thumbnail.id,
      status: status,
    };

    let response;

    // Create an new page
    if (isEmpty(id) && isEmpty(pageId)) {
      response = await agent.post(`/pages`).send(params);
    }

    // Update data for exist page
    if (!isEmpty(id) || !isEmpty(pageId)) {
      let itemId = isEmpty(id) ? pageId : id;
      response = await agent.put(`/pages/${itemId}`).send(params);
    }

    return response;
  }

  handleClickToggle(name) {
    this.setState({
      [name]: !this.state[name],
    });
  }

  handleChangeEditVisibility(event) {
    const { input, status } = this.state;
    let showInputPassword = false;
    let inputStatus = input.status;
    let inputPassword = input.password;

    // Check password is selected or not
    if (event.target.value === 'password') {
      showInputPassword = true;
    } else {
      inputPassword = '';
    }

    // Check private is selected or not
    if (event.target.value === 'private') {
      inputStatus = 'private';
    } else {
      if (status === 'private') {
        inputStatus = 'draft';
      } else {
        inputStatus = status;
      }
    }

    this.setState({
      showInputPassword: showInputPassword,
      input: {
        ...input,
        status: inputStatus,
        password: inputPassword,
      },
    });
  }

  renderPermalink(slug) {
    const { editSlugState } = this.state;

    return !isEmpty(slug) ? (
      <Row className="mt-3">
        <strong className="mr-2">Permalink:</strong>
        {editSlugState ? (
          <div style={{ display: 'inline-block' }}>
            <Col md={12} className="mr-2">
              <Input name="slug" value={slug} onChange={this.handleChange} />
            </Col>
            <Col md={11}>
              <Button onClick={() => this.handleClickToggle('editSlugState')}>OK</Button>
              <a className="text-primary" onClick={() => this.handleClickToggle('editSlugState')}>
                Cancel
              </a>
            </Col>
          </div>
        ) : (
          <div style={{ display: 'inline-block' }}>
            {slug}
            &nbsp;
            <Button onClick={() => this.handleClickToggle('editSlugState')}>Edit</Button>
          </div>
        )}
      </Row>
    ) : (
      ''
    );
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

  render() {
    const {
      title,
      slug,
      content,
      thumbnail,
      status,
      password,
      date,
      time,
      saveText,
      statusDescription,
      visibilityDescription,
      scheduleTitle,
      scheduleDescription,
      statusDisableEdit,
      scheduleText,
      loading,
    } = this.state;
    const id = this.props.match.params.id;

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
        <div className="utils__title utils__title--flat mb-3">
          <strong>{isEmpty(id) ? 'Add New Page' : 'Edit Page'}</strong>
        </div>
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
            </Row>
            {this.renderPermalink(slug)}
            <Row className="mt-3">
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

export default EditOrAddNewPage;
