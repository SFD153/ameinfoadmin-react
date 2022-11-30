import React from 'react';
import { Form, Select, Spin, Button, notification } from 'antd';
import agent from 'utils/agent';
import isEmpty from 'lodash/isEmpty';
import startCase from 'lodash/startCase';
import get from 'lodash/get';
import { get as getSetting, set as setSetting } from 'utils/setting';

const FormItem = Form.Item;
const Option = Select.Option;

class General extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      formLayout: 'horizontal',
      loading: true,
      posts: [],
      categories: [],
      users: [],
      settings: [],
      postParams: {
        select: 'title',
        sort: 'createdAt DESC',
        where: {
          status: 'publish',
        },
        perPage: '20',
      },
      userParams: {
        select: 'username',
        perPage: '20',
      },
      categoryParams: {
        select: 'slug,parent',
        perPage: '40',
      },
      settingParams: {
        select: 'name,value',
        where: {
          name: ['featured_general'],
        },
      },
    };

    this.handleSearchPost = this.handleSearchPost.bind(this);
    this.handleSearchAuthor = this.handleSearchAuthor.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  async componentDidMount() {
    await this.fetchPosts();
    await this.fetchAuthors();
    await this.fetchCategories();
    await this.fetchSettings();
  }

  async fetchPosts() {
    this.setState({ posts: [], loading: true });
    const { postParams } = this.state;
    let posts = [];

    try {
      let response = await agent.get('/posts').query(postParams);
      posts = response.body.results;
    } catch (e) {
      notification.open({
        type: 'error',
        name: 'Error',
        message: 'Can not get post',
      });
    }

    this.setState({ posts: posts, loading: false });
  }

  async fetchAuthors() {
    this.setState({ users: [], loading: true });
    const { userParams } = this.state;
    let users = [];

    try {
      let response = await agent.get('/users').query(userParams);
      users = response.body.results;
    } catch (e) {
      notification.open({
        type: 'error',
        name: 'Error',
        message: 'Can not get user',
      });
    }

    this.setState({ users: users, loading: false });
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

    let featuredGeneral = getSetting(settings, 'featured_general');

    if (!isEmpty(featuredGeneral)) {
      featuredGeneral = JSON.parse(featuredGeneral);
    }

    setFieldsValue({
      featuredPost: get(featuredGeneral, 'featuredPost', []),
      featuredText: get(featuredGeneral, 'featuredText', []),
      featuredMedia: get(featuredGeneral, 'featuredMedia', []),
      industry: get(featuredGeneral, 'industry', []),
      otherCategory: get(featuredGeneral, 'otherCategory', []),
      topInterview: get(featuredGeneral, 'topInterview', []),
      topAnalysis: get(featuredGeneral, 'topAnalysis', []),
      topFeature: get(featuredGeneral, 'topFeature', []),
      stream: get(featuredGeneral, 'stream', []),
      tip: get(featuredGeneral, 'tip', []),
      inspire: get(featuredGeneral, 'inspire', []),
      today: get(featuredGeneral, 'today', []),
      editor: get(featuredGeneral, 'editor', []),
      author: get(featuredGeneral, 'author', []),
    });

    this.setState({
      settings,
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

  handleSearchAuthor(value) {
    const { userParams } = this.state;
    userParams.where = {
      username: {
        like: `%${value}%`,
      },
    };

    let self = this;
    this.setState({ userParams: userParams }, async () => {
      await self.fetchAuthors();
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
      let setting = setSetting(settings, 'featured_general', fieldsValue);

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

      // Refresh featured general post
      await agent.put('/settings/featured-general/refresh');
    });
  }

  render() {
    const { formLayout } = this.state;
    const formItemLayout = this.getFormItemLayout(formLayout);
    const buttonItemLayout = this.getButtonItemLayout(formLayout);
    const { getFieldDecorator } = this.props.form;
    const { loading, posts, categories, users } = this.state;

    return (
      <div>
        <div className="utils__title utils__title--flat mb-3">
          <strong>General</strong>
        </div>
        <hr />
        <Form layout={formLayout} onSubmit={this.handleSubmit}>
          <div className="utils__title utils__title--flat mb-3">
            <span className="text-uppercase font-size-14" style={{ color: 'grey' }}>
              Featured Post
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
              Featured Text
            </span>
          </div>
          <FormItem label="Post filter" {...formItemLayout}>
            {getFieldDecorator('featuredText', {
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
              Featured Media
            </span>
          </div>
          <FormItem label="Post filter" {...formItemLayout}>
            {getFieldDecorator('featuredMedia', {
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
              Ameinfo Industries
            </span>
          </div>
          <FormItem label="Category filter" {...formItemLayout}>
            {getFieldDecorator('industry', {
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
          <hr />
          <div className="utils__title utils__title--flat mb-3">
            <span className="text-uppercase font-size-14" style={{ color: 'grey' }}>
              Top Interview
            </span>
          </div>
          <FormItem label="Post filter" {...formItemLayout}>
            {getFieldDecorator('topInterview', {
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
              Top Analysis
            </span>
          </div>
          <FormItem label="Post filter" {...formItemLayout}>
            {getFieldDecorator('topAnalysis', {
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
              Top Features
            </span>
          </div>
          <FormItem label="Post filter" {...formItemLayout}>
            {getFieldDecorator('topFeature', {
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
              Ameinfo Stream
            </span>
          </div>
          <FormItem label="Post filter" {...formItemLayout}>
            {getFieldDecorator('stream', {
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
              Ameinfo Tip
            </span>
          </div>
          <FormItem label="Post filter" {...formItemLayout}>
            {getFieldDecorator('tip', {
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
              Ameinfo Inspire
            </span>
          </div>
          <FormItem label="Post filter" {...formItemLayout}>
            {getFieldDecorator('inspire', {
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
              Ameinfo Today
            </span>
          </div>
          <FormItem label="Post filter" {...formItemLayout}>
            {getFieldDecorator('today', {
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
              Ameinfo Editor
            </span>
          </div>
          <FormItem label="Post filter" {...formItemLayout}>
            {getFieldDecorator('editor', {
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
              Author
            </span>
          </div>
          <FormItem label="Author filter" {...formItemLayout}>
            {getFieldDecorator('author', {
              initialValue: [],
            })(
              <Select
                mode="multiple"
                placeholder="Select author"
                labelInValue
                notFoundContent={loading ? <Spin size="small" /> : null}
                filterOption={false}
                onSearch={this.handleSearchAuthor}
                style={{ width: '100%' }}
              >
                {users.map(user => (
                  <Option key={user.id} value={user.id}>
                    {user.username}
                  </Option>
                ))}
              </Select>,
            )}
          </FormItem>
          <hr />
          <div className="utils__title utils__title--flat mb-3">
            <span className="text-uppercase font-size-14" style={{ color: 'grey' }}>
              Other Category
            </span>
          </div>
          <FormItem label="Category filter" {...formItemLayout}>
            {getFieldDecorator('otherCategory', {
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
          <hr />
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

export default Form.create()(General);
