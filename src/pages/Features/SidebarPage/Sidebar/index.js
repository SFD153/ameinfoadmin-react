import React from 'react';
import { Form, Select, Spin, Button, notification } from 'antd';
import agent from 'utils/agent';
import isEmpty from 'lodash/isEmpty';
import startCase from 'lodash/startCase';
import get from 'lodash/get';
import { get as getSetting, set as setSetting } from 'utils/setting';

const FormItem = Form.Item;
const Option = Select.Option;

class Sidebar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      formLayout: 'horizontal',
      settings: [],
      posts: [],
      categories: [],
      loading: true,
      postParams: {
        select: 'title',
        sort: 'createdAt DESC',
        where: {
          status: 'publish',
        },
        perPage: '20',
      },
      categoryParams: {
        select: 'slug,parent',
        perPage: '40',
      },
      settingParams: {
        select: 'name,value',
        where: {
          name: ['featured_sidebar'],
        },
      },
    };

    this.handleSearchPost = this.handleSearchPost.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  async componentDidMount() {
    await this.fetchPosts();
    await this.fetchCategories();
    await this.fetchSettings();
  }

  async fetchSettings() {
    const { setFieldsValue } = this.props.form;
    const { settingParams } = this.state;
    let settings = null;

    try {
      let response = await agent.get('/settings').query(settingParams);
      settings = response.body.results;
    } catch (e) {
      notification.open({
        type: 'error',
        message: 'Error',
        description: 'Can not get setting',
      });
    }

    if (isEmpty(settings)) {
      return null;
    }

    let featuresSidebar = getSetting(settings, 'featured_sidebar');

    if (!isEmpty(featuresSidebar)) {
      featuresSidebar = JSON.parse(featuresSidebar);
    }

    setFieldsValue({
      featuredPost: get(featuresSidebar, 'featuredPost', []),
      featuredCategory: get(featuresSidebar, 'featuredCategory', []),
    });

    this.setState({
      settings,
    });
  }

  async fetchPosts() {
    this.setState({ posts: [], loading: true });
    const { postParams } = this.state;
    let posts = [];

    try {
      let response = await agent.get('/posts').query(postParams);
      posts = response.body.results;
    } catch (e) {
      notification({
        type: 'error',
        name: 'Error',
        message: 'Can not get post',
      });
    }

    this.setState({ posts: posts, loading: false });
  }

  async fetchCategories() {
    const { categoryParams } = this.state;
    let categories = [];

    try {
      let response = await agent.get('/categories').query(categoryParams);
      categories = response.body.results;
      categories = categories.filter(category => !isEmpty(category.parent));
    } catch (e) {
      notification({
        type: 'error',
        name: 'Error',
        message: 'Can not get category',
      });
    }

    this.setState({ categories });
  }

  handleSearchPost(value) {
    const { postParams } = this.state;
    postParams.where = {
      title: {
        like: `%${value}%`,
      },
    };

    let self = this;
    this.setState({ postParams: postParams }, async () => {
      await self.fetchPosts();
    });
  }

  async handleSubmit(e) {
    e.preventDefault();
    const { settings } = this.state;
    const { validateFields } = this.props.form;
    validateFields(async (errors, values) => {
      if (errors) {
        return false;
      }

      let fieldsValue = JSON.stringify(values);
      let setting = setSetting(settings, 'featured_sidebar', fieldsValue);

      try {
        await agent.put('/settings').send([setting]);
        notification.open({
          type: 'success',
          message: 'Success',
          description: 'Save successfully',
        });
      } catch (e) {
        notification.open({
          type: 'error',
          message: 'Error',
          description: 'Can not save setting',
        });
      }
    });
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

  render() {
    const { formLayout } = this.state;
    const formItemLayout = this.getFormItemLayout(formLayout);
    const buttonItemLayout = this.getButtonItemLayout(formLayout);
    const { getFieldDecorator } = this.props.form;
    const { loading, posts, categories } = this.state;

    return (
      <div>
        <div className="utils__title utils__title--flat mb-3">
          <strong>Sidebar</strong>
        </div>
        <hr />
        <Form layout={formLayout} onSubmit={this.handleSubmit}>
          <div className="utils__title utils__title--flat mb-3">
            <span className="text-uppercase font-size-14" style={{ color: 'grey' }}>
              Featured Posts
            </span>
          </div>
          <FormItem label="Post filter" {...formItemLayout}>
            {getFieldDecorator('featuredPost', {
              initialValue: [],
            })(
              <Select
                mode="multiple"
                placeholder="Select post"
                labelInValue
                notFoundContent={loading ? <Spin size="small" /> : null}
                filterOption={false}
                onSearch={this.handleSearchPost}
                style={{ width: '100%' }}
              >
                {posts.map(post => (
                  <Option key={post.id} value={post.id}>
                    {post.title}
                  </Option>
                ))}
              </Select>,
            )}
          </FormItem>
          <hr />
          <div className="utils__title utils__title--flat mb-3">
            <span className="text-uppercase font-size-14" style={{ color: 'grey' }}>
              Featured Categories
            </span>
          </div>
          <FormItem label="Category filter" {...formItemLayout}>
            {getFieldDecorator('featuredCategory', {
              initialValue: [],
            })(
              <Select
                mode="multiple"
                placeholder="Select category"
                labelInValue
                filterOption={false}
                style={{ width: '100%' }}
              >
                {categories.map(category => (
                  <Option key={category.id} value={category.id}>
                    {startCase(category.slug.split('-').join(' '))}
                  </Option>
                ))}
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

export default Form.create()(Sidebar);
