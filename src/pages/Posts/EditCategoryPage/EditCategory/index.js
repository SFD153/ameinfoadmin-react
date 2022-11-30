import React from 'react';
import { Form, Input, Button, notification, Select } from 'antd';
import agent from 'utils/agent';
import isEmpty from 'lodash/isEmpty';

const FormItem = Form.Item;
const { Option } = Select;
const { TextArea } = Input;

class EditCategory extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      category: {},
      categories: [],
      formLayout: 'horizontal',
      categoryParam: {
        populate: 'parent',
      },
      categoriesParams: {
        select: 'id,name,parent',
        sort: 'createdAt DESC',
        perPage: '40',
      },
    };
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  async componentDidMount() {
    const { setFieldsValue } = this.props.form;
    const { categoryParam, categoriesParam } = this.state;
    let category = {};
    let categories = [];

    try {
      const id = this.props.match.params.id;
      const response = await agent.get(`/categories/${id}`).query(categoryParam);
      category = response.body;
    } catch (e) {
      notification.open({
        type: 'error',
        message: 'Error',
        description: 'Can not get category',
      });
    }

    try {
      const response = await agent.get('/categories').query(categoriesParam);
      categories = response.body.results;
    } catch (e) {
      notification.open({
        type: 'error',
        message: 'Error',
        description: 'Can not get list of categories',
      });
    }

    setFieldsValue({
      name: category.name,
      slug: category.slug,
      parent: isEmpty(category.parent) ? '' : category.parent.id,
      description: category.description,
      title: category.title,
    });

    this.setState({
      category: category,
      categories: categories,
    });
  }

  async handleSubmit(e) {
    e.preventDefault();
    const { name, slug, title, parent, description } = this.props.form.getFieldsValue();

    let id = this.props.match.params.id;

    let params = {
      name: name,
      slug: slug,
      title: title,
      description: description,
    };

    if (!isEmpty(parent)) {
      params.parent = parent;
    }

    try {
      await agent.put(`/categories/${id}`).send(params);
      this.props.history.push('/posts/categories');
    } catch (e) {
      notification.open({
        type: 'error',
        message: 'Error',
        description: 'Can not submit',
      });
    }
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const { formLayout, categories } = this.state;
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
          <strong>Edit Category</strong>
        </div>
        <Form layout={formLayout} onSubmit={this.handleSubmit}>
          <FormItem label="Name" {...formItemLayout}>
            {getFieldDecorator('name', {
              initialValue: '',
              rules: [
                {
                  required: true,
                  message: 'Please input category name',
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
            label="Parent Category"
            extra="Categories, unlike tags, can have a hierarchy. You might have a Jazz category, and
            under that have children categories for Bebop and Big Band. Totally optional."
            {...formItemLayout}
          >
            {getFieldDecorator('parent', {
              initialValue: '',
            })(
              <Select style={{ width: 200 }}>
                <Option value="">none</Option>
                {categories.map((category, index) => (
                  <Option key={index} value={category.id}>
                    {category.name}
                  </Option>
                ))}
              </Select>,
            )}
          </FormItem>
          <FormItem
            label="Title"
            extra="The title is not prominent by default; however, some themes may show it."
            {...formItemLayout}
          >
            {getFieldDecorator('title', {
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
          <FormItem label="Header Background" {...formItemLayout}>
            {getFieldDecorator('headerBackground', {
              initialValue: '',
            })(<Input />)}
          </FormItem>
          <FormItem label="Footer Background" {...formItemLayout}>
            {getFieldDecorator('footerBackground', {
              initialValue: '',
            })(<Input />)}
          </FormItem>
          <FormItem label="Title Background" {...formItemLayout}>
            {getFieldDecorator('titleBackground', {
              initialValue: '',
            })(<Input />)}
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

export default Form.create()(EditCategory);
