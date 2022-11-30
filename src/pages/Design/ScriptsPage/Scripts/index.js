import React from 'react';
import { Form, Input, Button } from 'antd';
import agent from 'utils/agent';
import isEmpty from 'lodash/isEmpty';
import { get, setEach } from 'utils/setting';
import { notification } from 'antd/lib/index';

const FormItem = Form.Item;
const { TextArea } = Input;

class Scripts extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      formLayout: 'horizontal',
      settings: [],
      params: {
        select: 'name,value',
        where: {
          name: ['header_script', 'after_body_script', 'footer_script'],
        },
      },
    };

    this.handleSubmit = this.handleSubmit.bind(this);
  }

  async componentDidMount() {
    const { setFieldsValue } = this.props.form;
    const { params } = this.state;
    let settings = null;

    try {
      let response = await agent.get('/settings').query(params);
      settings = response.body.results;
    } catch (e) {
      notification.open({
        type: 'error',
        message: 'Error',
        description: 'Can not get settings',
      });
    }

    if (isEmpty(settings)) {
      return null;
    }

    setFieldsValue({
      headerScript: get(settings, 'header_script'),
      afterBodyScript: get(settings, 'after_body_script'),
      footerScript: get(settings, 'footer_script'),
    });

    this.setState({
      settings,
    });
  }

  async handleSubmit(e) {
    e.preventDefault();
    const { getFieldsValue } = this.props.form;
    const { settings } = this.state;

    let listOfSettings = setEach(settings, getFieldsValue());

    try {
      await agent.put('/settings').send(listOfSettings);
    } catch (e) {
      notification.open({
        type: 'error',
        message: 'Error',
        description: 'Can not update settings',
      });
    }
  }

  render() {
    const { formLayout } = this.state;
    const { getFieldDecorator } = this.props.form;
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
    return (
      <div>
        <div className="utils__title utils__title--flat mb-3">
          <span className="text-uppercase font-size-16">Scripts</span>
        </div>
        <Form layout={formLayout} onSubmit={this.handleSubmit}>
          <FormItem label="Header Script" {...formItemLayout}>
            {getFieldDecorator('headerScript')(<TextArea rows={4} />)}
          </FormItem>
          <FormItem label="After Body Script" {...formItemLayout}>
            {getFieldDecorator('afterBodyScript')(<TextArea rows={4} />)}
          </FormItem>
          <FormItem label="Footer Script" {...formItemLayout}>
            {getFieldDecorator('footerScript')(<TextArea rows={4} />)}
          </FormItem>
          <FormItem {...buttonItemLayout}>
            <Button type="primary" htmlType="submit">
              Save Changes
            </Button>
          </FormItem>
        </Form>
      </div>
    );
  }
}

export default Form.create()(Scripts);
