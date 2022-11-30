import React from 'react';
import { connect } from 'react-redux';
import { REDUCER, submit } from 'ducks/login';
import { Form, Input, Button, Alert } from 'antd';
import { Link } from 'react-router-dom';
import agent from 'utils/agent';

const FormItem = Form.Item;

const mapStateToProps = state => ({
  isSubmitForm: state.app.submitForms[REDUCER],
});

@connect(mapStateToProps)
class ForgotForm extends React.Component {
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      error: null,
      message: null,
    };
  }

  // $FlowFixMe
  onSubmit = (isSubmitForm: ?boolean) => event => {
    event.preventDefault();
    const { form } = this.props;
    if (!isSubmitForm) {
      form.validateFields(async (error, values) => {
        if (error) {
          return false;
        }

        // Enable button loading
        this.setState({ loading: true });

        const { email } = values;

        try {
          await agent.post('/forgot').send({ email });
          this.setState({
            message: 'we have sent confirmation link, please check your mailbox',
            loading: false,
          });
        } catch (e) {
          this.setState({
            error: null,
            loading: false,
          });
        }
      });
    }
  };

  render() {
    const { error, message, loading } = this.state;
    const { isSubmitForm } = this.props;
    const { getFieldDecorator } = this.props.form;
    return (
      <div className="cat__pages__login__block__form">
        {message && (
          <Alert
            className="mb-4"
            message="Success"
            description={message}
            type="success"
            showIcon
            closable
            afterClose={() => this.setState({ message: null })}
          />
        )}
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
          <strong>Forgot password</strong>
        </h4>
        <br />
        <Form layout="vertical" hideRequiredMark onSubmit={this.onSubmit(isSubmitForm)}>
          <FormItem label="Email">
            {getFieldDecorator('email', {
              initialValue: '',
              rules: [
                { type: 'email', message: 'The input is not a valid e-mail address' },
                { required: true, message: 'Please input your e-mail address' },
              ],
            })(<Input size="default" />)}
          </FormItem>
          <div className="mb-2">
            <Link to="/login" className="utils__link--blue utils__link">
              ← Back to Login
            </Link>
          </div>
          <div className="form-actions">
            <Button type="primary" className="width-150 mr-4" htmlType="submit" loading={loading}>
              Get New Password
            </Button>
          </div>
        </Form>
      </div>
    );
  }
}

export default Form.create()(ForgotForm);
