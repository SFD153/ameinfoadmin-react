import React from 'react';
import { Form, Input, Button } from 'antd';
import agent from 'utils/agent';
import find from 'lodash/find';
import connect from 'react-redux/es/connect/connect';
import { notification } from 'antd/lib/index';
import { REDUCER, submitRegister } from 'ducks/login';
import { Link } from 'react-router-dom';

const FormItem = Form.Item;

const mapStateToProps = (state, props) => ({
  isSubmitForm: state.app.submitForms[REDUCER],
});

@connect(mapStateToProps)
class RegisterForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      email: '',
      password: '',
      formLayout: 'horizontal',
    };

    this.handleClick = this.handleClick.bind(this);
  }

  async handleClick() {
    let { username, email, password } = this.state;
    let params = {
      email: email,
      username: username,
      password: password,
    };

    try {
      await agent.post(`/users`).send(params);
      this.props.history.push('/users/all-users');
    } catch (e) {
      notification.open({
        type: 'error',
        message: 'Error',
        description: 'Can not register user',
      });
    }
  }

  async componentDidMount() {
    try {
      let response = await agent.get('/roles');
      let roles = response.body.results;
      let role = find(roles, role => role.name === 'subscriber');
      this.setState({
        roles: roles,
        roleId: role.id,
      });
    } catch (e) {
      notification.open({
        type: 'error',
        message: 'Error',
        description: 'Can not register at this time',
      });
    }
  }

  // $FlowFixMe
  onSubmit = isSubmitForm => event => {
    event.preventDefault();
    const { form, dispatch } = this.props;
    if (!isSubmitForm) {
      form.validateFields((error, values) => {
        if (!error) {
          dispatch(submitRegister(values));
        }
      });
    }
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const { isSubmitForm } = this.props;
    return (
      <div className="cat__pages__login__block__form">
        <h4 className="text-uppercase">
          <strong>Please register</strong>
        </h4>
        <br />
        <Form layout="vertical" hideRequiredMark onSubmit={this.onSubmit(isSubmitForm)}>
          <FormItem label="Email">
            {getFieldDecorator('email', {
              initialValue: '',
              rules: [
                {
                  type: 'email',
                  message: 'The input is not a valid e-mail address',
                },
                { required: true, message: 'Please input your e-mail address' },
              ],
            })(<Input size="default" />)}
          </FormItem>
          <FormItem label="Username">
            {getFieldDecorator('username', {
              initialValue: '',
              rules: [{ required: true, message: 'Please input your username' }],
            })(<Input size="default" />)}
          </FormItem>
          <FormItem label="Password">
            {getFieldDecorator('password', {
              initialValue: '',
              rules: [{ required: true, message: 'Please input your password' }],
            })(<Input size="default" type="password" />)}
          </FormItem>
          <div className="mb-2">
            Already have an account ? &nbsp;
            <Link to="/login" className="utils__link--blue utils__link">
              Login
            </Link>
          </div>
          <div className="form-actions">
            <Button
              type="primary"
              className="width-150 mr-4"
              htmlType="submit"
              loading={isSubmitForm}
            >
              Register
            </Button>
          </div>
        </Form>
      </div>
    );
  }
}

export default Form.create()(RegisterForm);
