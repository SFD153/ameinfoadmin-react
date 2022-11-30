import React from 'react';
import { connect } from 'react-redux';
import { dispatch } from 'stores';
import { push } from 'react-router-redux';
import { Form, Input, Button } from 'antd';
import { REDUCER, submit } from 'ducks/login';
import agent from 'utils/agent';

const FormItem = Form.Item;

const mapStateToProps = state => ({
  isSubmitForm: state.app.submitForms[REDUCER],
});

@connect(mapStateToProps)
class ResetForm extends React.Component {
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {
      loading: false,
    };
  }

  compareToFirstPassword = (rule, value, callback) => {
    const form = this.props.form;
    if (value && value !== form.getFieldValue('password')) {
      callback('Two passwords that you enter is inconsistent!');
    } else {
      callback();
    }
  };

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

        const { password } = values;
        const code = this.props.code;

        await agent.post(`/reset/${code}`).send({ password });

        dispatch(push('/login'));
        this.setState({ loading: false });
      });
    }
  };

  render() {
    const { loading } = this.state;
    const { isSubmitForm } = this.props;
    const { getFieldDecorator } = this.props.form;
    return (
      <div className="cat__pages__login__block__form">
        <h4 className="text-uppercase">
          <strong>Change password</strong>
        </h4>
        <br />
        <Form layout="vertical" hideRequiredMark onSubmit={this.onSubmit(isSubmitForm)}>
          <FormItem label="Password">
            {getFieldDecorator('password', {
              initialValue: '',
              rules: [{ required: true, message: 'Please input your password' }],
            })(<Input type="password" size="default" />)}
          </FormItem>
          <FormItem label="Confirm Password">
            {getFieldDecorator('confirmPassword', {
              initialValue: '',
              rules: [
                { required: true, message: 'Please input your confirm password' },
                { validator: this.compareToFirstPassword },
              ],
            })(<Input type="password" size="default" />)}
          </FormItem>
          <div className="form-actions">
            <Button type="primary" className="width-150 mr-4" htmlType="submit" loading={loading}>
              Submit
            </Button>
          </div>
        </Form>
      </div>
    );
  }
}

export default Form.create()(ResetForm);
