import React from 'react';
import { Form, Input, Button, notification, Select, Row, Col } from 'antd';
import agent from 'utils/agent';
import isEmpty from 'lodash/isEmpty';
import FeaturedImage from 'components/DashboardComponents/FeaturedImage';

const FormItem = Form.Item;
const { Option } = Select;
const { TextArea } = Input;

class EditCategory extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      category: {},
      thumbnail: {},
      categories: [],
      loading: false,
      formLayout: 'vertical',
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChangeUploadThumbnail = this.handleChangeUploadThumbnail.bind(this);
    this.handleClickRemoveThumbnail = this.handleClickRemoveThumbnail.bind(this);
  }

  async componentDidMount() {
    const { setFieldsValue } = this.props.form;
    let category = {};
    let categories = [];

    try {
      const id = this.props.match.params.id;
      const response = await agent.get(`/video_categories/${id}`).query({
        populate: 'parent,thumbnail',
      });
      category = response.body;
    } catch (e) {
      notification.open({
        type: 'error',
        message: 'Error',
        description: 'Can not get category',
      });
    }

    try {
      const response = await agent.get('/video_categories').query({
        select: 'id,name,parent',
        sort: 'createdAt DESC',
        perPage: '40',
      });
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
    });

    this.setState({
      category: category,
      categories: categories,
      thumbnail: category.thumbnail,
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

  async handleSubmit(e) {
    e.preventDefault();
    const { name, slug, parent, description } = this.props.form.getFieldsValue();
    const { thumbnail } = this.state;

    let id = this.props.match.params.id;

    let params = {
      name: name,
      slug: slug,
      description: description,
    };

    if (!isEmpty(parent)) {
      params.parent = parent;
    }

    if (!isEmpty(thumbnail)) {
      params.thumbnail = thumbnail.id;
    }

    try {
      await agent.put(`/video_categories/${id}`).send(params);
      this.props.history.push('/videos/categories');
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
    const { formLayout, categories, thumbnail, loading } = this.state;
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
            label="Description"
            extra="The description is not prominent by default; however, some themes may show it."
            {...formItemLayout}
          >
            {getFieldDecorator('description', {
              initialValue: '',
            })(<TextArea rows={6} />)}
          </FormItem>
          <Row>
            <Col xs={24} md={8}>
              <div className="card">
                <div className="card-body">
                  <FeaturedImage
                    name="media"
                    value={thumbnail}
                    loading={loading}
                    action={process.env.REACT_APP_API_URL + '/medias'}
                    onRemove={id => this.handleClickRemoveThumbnail(id)}
                    onChange={this.handleChangeUploadThumbnail}
                  />
                </div>
              </div>
            </Col>
          </Row>
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
