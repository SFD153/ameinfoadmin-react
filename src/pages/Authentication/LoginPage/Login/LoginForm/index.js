import React from 'react';
import { connect } from 'react-redux';
import { REDUCER, submit } from 'ducks/login';
import { Form, Input, Button, Alert } from 'antd';
import { Link } from 'react-router-dom';

const FormItem = Form.Item;

const mapStateToProps = state => ({
  isSubmitForm: state.app.submitForms[REDUCER],
});

@connect(mapStateToProps)
@Form.create()
class LoginForm extends React.Component {
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {
      error: null,
    };
  }

  // $FlowFixMe
  onSubmit = isSubmitForm => event => {
    event.preventDefault();
    const { form, dispatch } = this.props;
    if (!isSubmitForm) {
      form.validateFields((error, values) => {
        if (!error) {
          dispatch(submit(values)).then(res => {
            if (res && res.status === 400) {
              this.setState({ error: res.response.body.message });
            }
          });
        }
      });
    }
  };

  render() {
    const { error } = this.state;
    const { form, isSubmitForm } = this.props;

    return (
      <div className="cat__pages__login__block__form">
        {error && (
          <Alert
            className="mb-4"
            message="Error"
            description={error}
            type="error"
            showIcon
            closable
            afterClose={() => this.setState({ error: null })}
          />
        )}
        <h4 className="text-uppercase">
          <strong>Please log in</strong>
        </h4>
        <br />
        <Form layout="vertical" hideRequiredMark onSubmit={this.onSubmit(isSubmitForm)}>
          <FormItem label="Email">
            {form.getFieldDecorator('username', {
              rules: [
                {
                  type: 'email',
                  message: 'The input is not a valid e-mail address',
                },
                { required: true, message: 'Please input your e-mail address' },
              ],
            })(<Input size="default" />)}
          </FormItem>
          <FormItem label="Password">
            {form.getFieldDecorator('password', {
              rules: [{ required: true, message: 'Please input your password' }],
            })(<Input size="default" type="password" />)}
          </FormItem>
          <div className="mb-2">
            <Link to="/forgot" className="utils__link--blue utils__link">
              Forgot your password ?
            </Link>
          </div>
          <div className="form-actions">
            <Button
              type="primary"
              className="width-150 mr-4"
              htmlType="submit"
              loading={isSubmitForm}
            >
              Login
            </Button>
            <Link to={'/register'} className="width-100" htmlType="button">
              Register
            </Link>
          </div>
        </Form>
      </div>
    );
  }
}

export default LoginForm;
