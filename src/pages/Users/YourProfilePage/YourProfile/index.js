import React from 'react';
import { Form, Input, Button, Select, Upload, message } from 'antd';
import agent from 'utils/agent';
import { notification } from 'antd/lib/index';
import isEmpty from 'lodash/isEmpty';
import { connect } from 'react-redux';
import Can from 'utils/Can';
import get from 'lodash/get';

const FormItem = Form.Item;
const Option = Select.Option;
const { TextArea } = Input;

@connect(state => ({
  role: state.app.userState.role,
  userInfo: state.app.userInfo,
}))
class YourProfile extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      formLayout: 'horizontal',
      user: {},
      roles: [],
      defaultAvatar: 'resources/images/user-avatar.png',
      linkAvatar: '',
      avatarId: '',
      userParams: {
        select: 'username,email,firstName,lastName,biographicalInfo,role',
        populate: 'avatar',
      },
    };

    this.handleChange = this.handleChange.bind(this);
    this.beforeUpload = this.beforeUpload.bind(this);
    this.handleChangeAvatar = this.handleChangeAvatar.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleFormLayoutChange = this.handleFormLayoutChange.bind(this);
  }
  async componentDidMount() {
    const { id } = this.props.userInfo;
    const { userParams } = this.state;
    const { setFieldsValue } = this.props.form;
    let user = {};
    let roles = [];

    try {
      let response = await agent.get(`/users/${id}`).query(userParams);
      user = response.body;
    } catch (e) {
      notification.open({
        type: 'error',
        message: 'Error',
        description: 'Can not get user',
      });
    }

    try {
      let response = await agent.get('/roles');
      roles = response.body.results;
    } catch (e) {
      notification.open({
        type: 'error',
        message: 'Error',
        description: 'Can not get list of roles',
      });
    }

    setFieldsValue({
      username: get(user, 'username'),
      firstName: get(user, 'firstName'),
      lastName: get(user, 'lastName'),
      email: get(user, 'email'),
      biographicalInfo: get(user, 'biographicalInfo'),
      roleId: get(user, 'role'),
    });

    this.setState({
      user: user,
      roles: roles,
      linkAvatar: get(user, 'avatar.link'),
      avatarId: get(user, 'avatar.id'),
    });
  }

  async handleSubmit(e) {
    e.preventDefault();
    const { validateFields } = this.props.form;
    const { user, avatarId } = this.state;
    const { id } = this.props.userInfo;

    validateFields(async (errors, value) => {
      if (errors) {
        return false;
      }

      let data = {
        username: get(user, 'username'),
        email: get(value, 'email'),
        firstName: get(value, 'firstName'),
        lastName: get(value, 'lastName'),
        password: get(value, 'password'),
        biographicalInfo: get(value, 'biographicalInfo'),
        avatarId: get(value, 'avatar.file.response.id') || avatarId,
        roleId: get(user, 'role'),
      };

      try {
        await agent.put(`/users/${id}`).send(data);
        notification.open({
          type: 'success',
          message: 'Success',
          description: 'Save profile successfully',
        });
      } catch (e) {
        notification.open({
          type: 'error',
          message: 'Error',
          description: 'Can not save user profile',
        });
      }
    });
  }

  handleFormLayoutChange = e => {
    this.setState({ formLayout: e.target.value });
  };

  handleChange(value) {
    this.setState({ roleId: value });
  }

  handleChangeAvatar(info) {
    if (info.file.status === 'done') {
      let media = info.file.response;

      this.setState({
        linkAvatar: get(media, 'link'),
      });
    }
  }

  beforeUpload(file) {
    const isImage = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isImage) {
      message.error('You can only upload JPG/PNG file!');
    }

    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('Image must smaller than 2MB!');
    }

    return isImage && isLt2M;
  }

  render() {
    const { formLayout, roles, linkAvatar, defaultAvatar } = this.state;

    const formItemLayout =
      formLayout === 'horizontal'
        ? {
            labelCol: { span: 4 },
            wrapperCol: { span: 14 },
          }
        : null;
    const buttonItemLayout =
      formLayout === 'horizontal'
        ? {
            labelCol: { span: 4, offset: 4 },
          }
        : null;
    const { getFieldDecorator } = this.props.form;
    return (
      <div>
        <div className="utils__title utils__title--flat mb-3">
          <span className="text-uppercase font-size-16">
            <strong>Profile</strong>
          </span>
        </div>
        <Form layout={formLayout} onSubmit={this.handleSubmit}>
          <FormItem label="Username" {...formItemLayout}>
            {getFieldDecorator('username', {
              initialValue: '',
              rules: [
                {
                  required: true,
                  message: 'Please input username',
                },
              ],
            })(<Input disabled />)}
            <p className="ant-upload-hint font-italic">Username cannot be changed</p>
          </FormItem>
          <FormItem label="Email" {...formItemLayout}>
            {getFieldDecorator('email', {
              initialValue: '',
              rules: [
                {
                  required: true,
                  message: 'Please input email',
                },
              ],
            })(<Input />)}
          </FormItem>
          <FormItem label="First Name" {...formItemLayout}>
            {getFieldDecorator('firstName', {
              initialValue: '',
            })(<Input />)}
          </FormItem>
          <FormItem label="Last Name" {...formItemLayout}>
            {getFieldDecorator('lastName', {
              initialValue: '',
            })(<Input />)}
          </FormItem>
          <FormItem label="New Password" {...formItemLayout}>
            {getFieldDecorator('password', {
              initialValue: '',
            })(<Input type="password" />)}
          </FormItem>
          <Can do="manage" on={{ __type: 'ADMIN', assignee: this.props.role }}>
            <FormItem label="Role" {...formItemLayout}>
              {getFieldDecorator('roleId', {
                initialValue: 'Subscriber',
              })(
                <Select style={{ width: 140 }}>
                  {roles.map(role => {
                    return <Option key={role.id}>{role.display}</Option>;
                  })}
                </Select>,
              )}
            </FormItem>
          </Can>
          <FormItem label="Biographical Info" {...formItemLayout}>
            {getFieldDecorator('biographicalInfo', {
              initialValue: '',
            })(<TextArea rows={4} />)}
            <p className="ant-upload-hint font-italic">
              Share a little biographical information to fill out your profile. This may be shown
              publicly.
            </p>
          </FormItem>
          <FormItem label="Profile Picture" {...formItemLayout}>
            {getFieldDecorator('avatar', {
              initialValue: '',
            })(
              <Upload
                name="media"
                listType="picture-card"
                showUploadList={false}
                action={process.env.REACT_APP_API_URL + '/medias'}
                beforeUpload={this.beforeUpload}
                onChange={this.handleChangeAvatar}
              >
                <img
                  src={isEmpty(linkAvatar) ? defaultAvatar : linkAvatar}
                  height={96}
                  width={96}
                  alt="profile"
                />
              </Upload>,
            )}
          </FormItem>
          <FormItem {...buttonItemLayout}>
            <Button type="primary" htmlType="submit">
              Update Profile
            </Button>
          </FormItem>
        </Form>
      </div>
    );
  }
}

export default Form.create()(YourProfile);
