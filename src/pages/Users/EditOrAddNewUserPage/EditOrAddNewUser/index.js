import React from 'react';
import { Form, Input, Button, Select, Upload } from 'antd';
import agent from 'utils/agent';
import { message, notification } from 'antd/lib/index';
import isEmpty from 'lodash/isEmpty';
import find from 'lodash/find';
import get from 'lodash/get';
import omit from 'lodash/omit';
import capitalize from 'lodash/capitalize';
import { dispatch } from 'stores';
import { push } from 'react-router-redux';

const FormItem = Form.Item;
const Option = Select.Option;
const { TextArea } = Input;

class EditOrAddNewUser extends React.Component {
  constructor(props) {
    super(props);
    this.INITIAL_STATE = {
      formLayout: 'horizontal',
      roles: [],
      defaultRoleId: '',
      avatarId: '',
      linkAvatar: '',
      userParams: {
        select: 'username,firstName,lastName,email,biographicalInfo,role',
        populate: 'avatar',
      },
    };

    this.state = this.INITIAL_STATE;

    this.handleFormLayoutChange = this.handleFormLayoutChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleChangeAvatar = this.handleChangeAvatar.bind(this);
  }

  async componentDidUpdate(prevProps) {
    // Set state to default if page is add new
    if (prevProps.match.params.id !== this.props.match.params.id) {
      this.props.form.resetFields();
      this.setState(this.INITIAL_STATE);
    }
  }

  async componentDidMount() {
    const id = this.props.match.params.id;
    await this.fetchDefault();

    if (!isEmpty(id)) {
      await this.fetchDataById();
    }
  }

  async fetchDefault() {
    let roles = [];
    let defaultRoleId = '';
    try {
      let response = await agent.get(`/roles`);
      roles = response.body.results;
      const role = find(roles, { name: 'subscriber' });
      defaultRoleId = role.id;
    } catch (e) {
      notification.open({
        type: 'error',
        message: 'Error',
        description: 'Can not get list of roles',
      });
    }

    this.setState({ roles: roles, defaultRoleId: defaultRoleId });
  }

  async fetchDataById() {
    const id = this.props.match.params.id;
    const { userParams } = this.state;
    const { setFieldsValue } = this.props.form;

    let user = '';
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

    setFieldsValue({
      username: get(user, 'username'),
      email: get(user, 'email'),
      firstName: get(user, 'firstName'),
      lastName: get(user, 'lastName'),
      biographicalInfo: get(user, 'biographicalInfo'),
      roleId: get(user, 'role'),
    });

    this.setState({
      linkAvatar: get(user, 'avatar.link'),
      avatarId: get(user, 'avatar.id'),
    });
  }

  async handleSubmit(e) {
    e.preventDefault();
    const { validateFields } = this.props.form;
    const { avatarId } = this.state;
    let id = this.props.match.params.id;
    validateFields(async (errors, value) => {
      if (errors) {
        return false;
      }

      let params = value;
      let avatar = get(params, 'avatar.file.response.id') || avatarId;
      params.avatarId = avatar;
      params = omit(params, 'avatar');

      if (isEmpty(avatar)) {
        params = omit(params, 'avatarId');
      }

      try {
        // Check page is add new or edit
        if (isEmpty(id)) {
          await agent.post(`/users`).send(params);
        } else {
          await agent.put(`/users/${id}`).send(params);
        }

        // Redirect to all users page
        dispatch(push('/users/all-users'));
      } catch (e) {
        const response = e.response.body;
        const code = get(response, 'code');
        switch (code) {
          case 'E_UNIQUE':
            notification.open({
              type: 'error',
              message: 'Error',
              description: capitalize(response.message),
            });
            break;
          default:
            notification.open({
              type: 'error',
              message: 'Error',
              description: 'Can not submit data into server',
            });
            break;
        }
      }
    });
  }

  handleFormLayoutChange(e) {
    this.setState({ formLayout: e.target.value });
  }

  handleChange(event) {
    this.setState({ [event.target.name]: event.target.value });
  }

  getFormItemLayout(formLayout) {
    return formLayout === 'horizontal'
      ? {
          labelCol: { span: 4 },
          wrapperCol: { span: 14 },
        }
      : null;
  }

  getButtonItemLayout(formLayout) {
    return formLayout === 'horizontal'
      ? {
          labelCol: { span: 4, offset: 4 },
        }
      : null;
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
    const { roles, linkAvatar, defaultRoleId } = this.state;
    const { formLayout } = this.state;
    const formItemLayout = this.getFormItemLayout(formLayout);
    const buttonItemLayout = this.getButtonItemLayout(formLayout);
    const defaultAvatar = 'resources/images/user-avatar.png';
    const { getFieldDecorator } = this.props.form;
    const userId = this.props.match.params.id;
    return (
      <div>
        <div className="utils__title utils__title--flat mb-3">
          <strong>{isEmpty(userId) ? 'Add New user' : 'Edit User'}</strong>
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
            })(<Input />)}
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
          <FormItem label="Password" {...formItemLayout}>
            {getFieldDecorator('password', {
              initialValue: '',
              rules: [
                {
                  required: isEmpty(userId),
                  message: 'Please input password',
                },
              ],
            })(<Input type="password" />)}
          </FormItem>
          <FormItem label="Biographical Info" {...formItemLayout}>
            {getFieldDecorator('biographicalInfo', {
              initialValue: '',
            })(<TextArea rows={4} />)}
            <p className="ant-upload-hint font-italic">
              Share a little biographical information to fill out your profile. This may be shown
              publicly.
            </p>
          </FormItem>
          <FormItem label="Upload Photo" {...formItemLayout}>
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
          <FormItem label="Role" {...formItemLayout}>
            {getFieldDecorator('roleId', {
              initialValue: defaultRoleId,
            })(
              <Select style={{ width: 140 }}>
                {roles.map(role => {
                  return <Option key={role.id}>{role.display}</Option>;
                })}
              </Select>,
            )}
          </FormItem>
          <FormItem {...buttonItemLayout}>
            <Button type="primary" htmlType="submit">
              Submit
            </Button>
          </FormItem>
        </Form>
      </div>
    );
  }
}

export default Form.create()(EditOrAddNewUser);
