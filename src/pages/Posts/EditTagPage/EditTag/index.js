import React from 'react';
import { Form, Input, Button } from 'antd';
import agent from 'utils/agent';
import { notification } from 'antd/lib/index';

const FormItem = Form.Item;
const { TextArea } = Input;

class EditTag extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tag: [],
      name: '',
      slug: '',
      formLayout: 'horizontal',
    };
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  async componentDidMount() {
    const { setFieldsValue } = this.props.form;
    let tag = {};

    try {
      let id = this.props.match.params.id;
      let response = await agent.get(`/tags/${id}`);
      tag = response.body;
    } catch (e) {
      notification.open({
        type: 'error',
        message: 'Error',
        description: 'Can not get tag',
      });
    }

    setFieldsValue({
      name: tag.name,
      slug: tag.slug,
      description: tag.description,
    });
  }

  async handleSubmit(e) {
    e.preventDefault();
    const { name, slug, description } = this.props.form.getFieldsValue();
    let id = this.props.match.params.id;

    let params = {
      name: name,
      slug: slug,
      description: description,
    };

    try {
      await agent.put(`/tags/${id}`).send(params);
      this.props.history.push('/posts/tags');
      console.log('a');
    } catch (e) {
      notification.open({
        type: 'error',
        message: 'Error',
        description: 'Can submit tag',
      });
    }
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const { formLayout } = this.state;
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
          <strong>Edit Tag</strong>
        </div>
        <Form layout={formLayout} onSubmit={this.handleSubmit}>
          <FormItem label="Name" {...formItemLayout}>
            {getFieldDecorator('name', {
              initialValue: '',
              rules: [
                {
                  required: true,
                  message: 'Please input tag name',
                },
              ],
            })(<Input />)}
          </FormItem>
          <FormItem label="Slug" {...formItemLayout}>
            {getFieldDecorator('slug', {
              initialValue: '',
            })(<Input />)}
          </FormItem>
          <FormItem
            label="Description"
            extra="The description is not prominent by default; however, some themes may show it."
            {...formItemLayout}
          >
            {getFieldDecorator('description', {
              initialValue: '',
            })(<TextArea rows={6} />)}
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

export default Form.create()(EditTag);
