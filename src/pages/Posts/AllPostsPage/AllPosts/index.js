import React from 'react';
import { Table, Button, Input, Select, notification, Popconfirm } from 'antd';
import { Divider } from 'antd';
import { Row, Col } from 'antd';
import { Link } from 'react-router-dom';
import moment from 'moment';
import agent from 'utils/agent';
import isEmpty from 'lodash/isEmpty';
import remove from 'lodash/remove';
import omit from 'lodash/omit';
import get from 'lodash/get';
import { getOrderAbbreviation } from 'utils/abbreviation';
import { getUniqueDate } from 'utils/post';
import Can, { listRole } from 'utils/Can';
import { connect } from 'react-redux';
import startCase from 'lodash/startCase';
import cn from 'classnames';

const Search = Input.Search;
const Option = Select.Option;

@connect(state => ({
  role: state.app.userState.role,
  userInfo: state.app.userInfo,
}))
class AllPosts extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      keywords: '',
      posts: [],
      postsId: [],
      categories: [],
      postId: '',
      params: {
        select: 'title,slug,createdAt,updatedAt,status,scheduleDate',
        populate: 'user,tags,categories,lock',
        sort: 'createdAt DESC',
        where: {
          status: ['publish', 'draft', 'pending', 'preview', 'private'],
        },
      },
      categoryParams: {
        select: 'name,parent',
        perPage: '40',
      },
      count: {
        total: 0,
        publish: 0,
        schedule: 0,
        draft: 0,
        trash: 0,
      },
      pagination: {},
      filter: 'all',
      action: '',
      open: false,
      visible: false,
    };

    this.getAllPosts = this.getAllPosts.bind(this);
    this.handleSearchChange = this.handleSearchChange.bind(this);
    this.handleTableChange = this.handleTableChange.bind(this);
    this.handleClickStatus = this.handleClickStatus.bind(this);
    this.handleChangeDate = this.handleChangeDate.bind(this);
    this.handleChangeCategory = this.handleChangeCategory.bind(this);
    this.handleClickFilter = this.handleClickFilter.bind(this);
    this.handleRowChange = this.handleRowChange.bind(this);
    this.handleBulkActionChange = this.handleBulkActionChange.bind(this);
    this.handleClickApply = this.handleClickApply.bind(this);
    this.handleClickChangeStatus = this.handleClickChangeStatus.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
  }

  async componentDidMount() {
    let { categoryParams, params, count } = this.state;
    let posts = [];
    let total = 0;
    let categories = [];
    let countData = count;

    // fetch categories
    try {
      const response = await agent.get('/categories').query(categoryParams);
      categories = response.body.results.filter(result => !isEmpty(result.parent));
    } catch (e) {
      notification.open({
        type: 'error',
        message: 'Error',
        description: 'Can not get categories',
      });
    }

    // fetch count
    try {
      const response = await agent.get('/posts/count');
      countData = response.body;
    } catch (e) {
      notification.open({
        type: 'error',
        message: 'Error',
        description: 'Can not get count',
      });
    }

    // Fetch posts
    try {
      let response = await agent.get('/posts').query(params);
      posts = response.body.results;
      total = response.body.meta.totalCount;
    } catch (e) {
      notification.open({
        type: 'error',
        message: 'Error',
        description: 'Can not get list of posts',
      });
    }

    this.setState({
      posts: posts,
      categories: categories,
      loading: false,
      count: countData,
      originalPosts: posts,
      pagination: {
        total: total,
      },
    });
  }

  async getAllPosts() {
    this.setState({ loading: true });

    let { params, pagination } = this.state;
    let posts = [];
    let total = get(pagination, 'total', 0);

    try {
      let response = await agent.get('/posts').query(params);
      posts = response.body.results;
      total = response.body.meta.totalCount;
    } catch (e) {
      notification.open({
        type: 'error',
        message: 'Error',
        description: 'Can not get',
      });
    }

    this.setState({
      posts: posts,
      loading: false,
      pagination: {
        total: total,
      },
    });
  }

  async findPost(keywords = '', page = 1, field = 'createdAt', order = 'DESC') {
    this.setState({ loading: true });

    let total = 0;
    let posts = [];

    const params = { keywords, page, [field]: order, isAdmin: true };

    try {
      let response = await agent.get('/search/posts').query(params);
      total = response.body.meta.totalCount;
      posts = response.body.results;
    } catch (e) {
      notification.open({
        type: 'error',
        message: 'Error',
        description: 'Can not get',
      });
    }

    this.setState({
      keywords,
      posts,
      loading: false,
      pagination: { total },
    });
  }

  async handleSearchChange(event) {
    let value = event.target.value;

    if (!isEmpty(value)) {
      await this.findPost(value);
    } else {
      await this.getAllPosts();
    }
  }

  async handleTableChange(pagination, filters, sorter) {
    let { params, keywords } = this.state;
    let order = getOrderAbbreviation(sorter.order);
    let field = sorter.field;

    // This for sort field
    let sort = field + ' ' + order;

    // This is for page
    let page = pagination.current;

    let param = {
      ...params,
      sort: sort,
      page: page,
    };

    // Remove sort when order is empty
    if (isEmpty(order)) {
      param.sort = params.sort;
    }

    this.setState({ params: param }, async () => {
      if (!isEmpty(keywords)) {
        await this.findPost(keywords, page, field, order);
      } else {
        await this.getAllPosts();
      }
    });
  }

  async handleClickChangeStatus(id, status) {
    let { posts, count } = this.state;
    let listOfPost = posts;
    let message = '';
    let updater = count;

    try {
      // Base on status to move to trash or delete it
      switch (status) {
        case 'trash':
          await agent.delete(`/posts/${id}`);
          message = 'Deleted successfully';
          updater['trash']--;
          break;
        case 'draft':
        case 'publish':
        case 'scheduled':
        case 'pending':
        case 'private':
          await agent.put(`/posts/${id}/status/trash`);
          message = 'Move to trash successfully';
          updater[status]--;
          updater['trash']++;
          break;
        case 'restore':
          await agent.put(`/posts/${id}/status/draft`);
          message = 'Restore successfully';
          updater['draft']++;
          updater['trash']--;
          break;
        default:
          break;
      }

      remove(listOfPost, post => post.id === id);

      notification.open({
        type: 'success',
        message: 'Success',
        description: message,
      });
    } catch (e) {
      notification.open({
        type: 'error',
        message: 'Error',
        description: 'Can not delete post',
      });
    }

    // Refresh featured general post
    await agent.put('/settings/featured-general/refresh');

    this.setState({
      posts: listOfPost,
      count: updater,
    });
  }

  async handleClickStatus(status = null) {
    let { count, params } = this.state;
    let where = {
      status: status,
    };

    if (isEmpty(status)) {
      where.status = {
        '!=': 'trash',
      };
    }

    if (status === 'schedule') {
      where = {
        scheduleDate: {
          '>': 0,
        },
      };
    }

    let param = {
      ...params,
      where: where,
    };

    let state = {
      params: param,
      pagination: {
        total: count[status],
      },
    };

    let self = this;
    this.setState(state, async () => {
      await self.getAllPosts();
    });
  }

  async getPostsByCategory(categoryId) {
    this.setState({ loading: true });

    let { posts, params } = this.state;
    let listOfPost = posts;
    let total = 0;

    try {
      let response = await agent.get(`/categories/${categoryId}/posts`).query(params);
      listOfPost = response.body.results;
      total = response.body.meta.totalCount;
    } catch (e) {
      notification.open({
        type: 'error',
        message: 'Error',
        description: 'Can not get filter category',
      });
    }

    this.setState({
      posts: listOfPost,
      loading: false,
      pagination: {
        total: total,
      },
    });
  }

  async getPostsByDate(timestamp) {
    let startDate = moment(timestamp)
      .startOf('day')
      .valueOf();
    let endDate = moment(timestamp)
      .endOf('day')
      .valueOf();
    let { params } = this.state;

    let param = {
      ...params,
      where: {
        createdAt: {
          '>': startDate,
          '<=': endDate,
        },
      },
    };

    let self = this;
    this.setState({ params: param }, async () => {
      await self.getAllPosts();
    });
  }

  handleChangeDate(value) {
    const { filter } = this.state;
    this.setState({
      filter: {
        ...filter,
        date: value,
      },
    });
  }

  handleChangeCategory(filter) {
    this.setState({ filter });
  }

  async handleClickFilter() {
    const { filter } = this.state;
    const category = filter;
    if (category === 'all') {
      await this.getAllPosts();
    } else {
      await this.getPostsByCategory(category);
    }
  }

  handleRowChange(selectedRowKey) {
    this.setState({
      postsId: selectedRowKey,
    });
  }

  handleBulkActionChange(value) {
    this.setState({
      action: value,
    });
  }

  async handleClickApply() {
    let { posts, postsId, action } = this.state;

    if (action !== 'delete') {
      return false;
    }

    let params = {
      postsId: postsId,
    };

    let listOfPosts = posts;

    this.setState({ loading: true });

    try {
      await agent.delete('/posts').send(params);
      postsId.forEach(id => {
        remove(listOfPosts, post => post.id === id);
      });
    } catch (e) {
      notification.open({
        type: 'error',
        message: 'Error',
        description: 'Can not delete post permently',
      });
    }
    this.setState({
      posts: listOfPosts,
      loading: false,
    });
  }

  openPreviewTab(url) {
    window.open(process.env.REACT_APP_WEB_URL + `${url}`);
  }

  handleCancel() {
    this.setState({
      visible: false,
    });
  }

  render() {
    const { categories, posts, loading, count, pagination, params } = this.state;

    const tableColumns = [
      {
        title: 'Title',
        dataIndex: 'title',
        key: 'title',
        width: '25%',
        sorter: true,
        render: (text, record) => {
          let status = record.status;

          if (record.scheduleDate !== 0) {
            status = 'Scheduled';
          }

          if (status === 'publish') {
            status = '';
          }

          let prefix = ' — ';
          if (isEmpty(status)) {
            prefix = '';
          }

          let lock = '';
          if (!isEmpty(record.lock)) {
            lock = ` — ${record.lock.username} is currently editing`;
          }

          const currentUsername = this.props.userInfo.username;
          let isLock = false;

          if (!isEmpty(record.lock)) {
            isLock = true;
          }

          if (get(record, 'lock.username') === currentUsername) {
            isLock = false;
          }

          return (
            <div>
              <div
                className={cn({
                  hide: !isLock,
                })}
              >
                {lock}
              </div>
              <Link
                to={'/posts/edit-post/' + record.id}
                className={cn({
                  'disable-link': isLock,
                })}
              >
                {record.title}
                <span style={{ color: '#555', fontWeight: '600' }}>
                  {prefix}
                  {startCase(status)}
                </span>
              </Link>
            </div>
          );
        },
      },
      {
        title: 'Author',
        dataIndex: 'user.username',
        key: 'user.username',
        width: '10%',
        render: (text, record) => {
          return isEmpty(record.user) ? '—' : record.user.username;
        },
      },
      {
        title: 'Categories',
        dataIndex: 'categories',
        key: 'categories',
        width: '20%',
        render: (text, record) => {
          return isEmpty(record.categories)
            ? '—'
            : record.categories.map(record => record.name).join(', ');
        },
      },
      {
        title: 'Tag',
        dataIndex: 'tags',
        key: 'tags',
        width: '20%',
        render: (text, record) => {
          return isEmpty(record.tags) ? '—' : record.tags.map(record => record.name).join(', ');
        },
      },
      {
        title: 'Date',
        dataIndex: 'createdAt',
        key: 'createdAt',
        width: '10%',
        sorter: true,
        render: (text, record) => {
          let date;
          if (record.createdAt === record.updatedAt) {
            date = record.createdAt;
          } else {
            date = record.createdAt;
          }

          let status;
          if (record.scheduleDate !== 0) {
            status = 'Scheduled';
          } else if (record.createdAt === record.updatedAt) {
            status = 'Published';
          } else if (record.status === 'draft') {
            status = 'Last Modified';
          } else {
            status = 'Last Modified';
          }

          return (
            <div className="date">
              {status}
              <br />
              {record.scheduleDate !== 0 ? (
                <abbr title={moment(record.scheduleDate).format('YYYY/MM/DD HH:mm:ss a')}>
                  {moment(record.scheduleDate).format('YYYY/MM/DD')}
                </abbr>
              ) : (
                <abbr title={moment(date).format('YYYY/MM/DD HH:mm:ss a')}>
                  {moment(date).format('YYYY/MM/DD')}
                </abbr>
              )}
            </div>
          );
        },
      },
      {
        title: 'Action',
        dataIndex: 'action',
        key: 'action',
        width: '15%',
        render: (text, record) => {
          const currentUsername = this.props.userInfo.username;
          let isLock = false;

          if (!isEmpty(record.lock)) {
            isLock = true;
          }

          if (get(record, 'lock.username') === currentUsername) {
            isLock = false;
          }

          return (
            <Can do="manage" on={{ __type: 'CONTRIBUTOR', assignee: this.props.role }}>
              <div className="editable-row-operations">
                <Row>
                  {get(params, 'where.status') === 'trash' && (
                    <Col md={5}>
                      <a
                        href="javascript:void(0)"
                        className="text-success"
                        onClick={() => this.handleClickChangeStatus(record.id, 'restore')}
                      >
                        <i className="fa fa-mail-reply" />
                      </a>
                    </Col>
                  )}
                  {get(params, 'where.status') !== 'trash' && (
                    <Col md={5}>
                      <a className="text-info" onClick={() => this.openPreviewTab(record.masklink)}>
                        <i className="fa fa-eye" />
                      </a>
                    </Col>
                  )}
                  {!isLock && (
                    <Col md={5}>
                      <Link className="text-warning" to={'/posts/edit-post/' + record.id}>
                        <i className="fa fa-edit" />
                      </Link>
                    </Col>
                  )}
                  {!isLock && (
                    <Col md={4} className="editable-row-operations">
                      <Popconfirm
                        title="Sure to delete?"
                        onConfirm={() => this.handleClickChangeStatus(record.id, record.status)}
                      >
                        <a href="javascript:void(0)" className="text-danger">
                          <i className="fa fa-times" />
                        </a>
                      </Popconfirm>
                    </Col>
                  )}
                </Row>
              </div>
            </Can>
          );
        },
      },
    ];

    return (
      <Row>
        <div className="utils__title utils__title--flat mb-3">
          <span className="text-uppercase font-size-16">Posts</span>
          <Can do="manage" on={{ __type: 'AUTHOR', assignee: this.props.role }}>
            <Link to="/posts/add-new">
              <Button className="ml-3">Add New</Button>
            </Link>
          </Can>
        </div>
        <Row>
          <Col xs={17} md={19}>
            <a href="javascript:void(0)" onClick={() => this.handleClickStatus()}>
              <strong>All</strong> ({count.total})
            </a>
            {/*<a href="#">Mine (8)</a>*/}
            <Divider type="vertical" />
            <a href="javascript:void(0)" onClick={() => this.handleClickStatus('publish')}>
              Published ({count.publish})
            </a>
            <Divider type="vertical" />
            <a href="javascript:void(0)" onClick={() => this.handleClickStatus('schedule')}>
              Scheduled ({count.schedule})
            </a>
            <Can do="privatePost" on={{ __type: 'EDITOR', assignee: this.props.role }}>
              <Divider type="vertical" />
              <a href="javascript:void(0)" onClick={() => this.handleClickStatus('draft')}>
                Drafts ({count.draft})
              </a>
            </Can>
            {/*<Divider type="vertical" />*/}
            {/*<a href="#">Pending (13)</a>*/}
            <Can do="otherPost" on={{ __type: 'EDITOR', assignee: this.props.role }}>
              <Divider type="vertical" />
              <a href="javascript:void(0)" onClick={() => this.handleClickStatus('trash')}>
                Trash ({count.trash})
              </a>
            </Can>
          </Col>
          <Col xs={7} md={5}>
            <Search placeholder="search" onChange={this.handleSearchChange} />
          </Col>
        </Row>
        <br />
        <Row>
          <Col xs={24} md={19}>
            <Col xs={8} md={7}>
              <Select
                defaultValue="Bulk Actions"
                style={{ width: 120 }}
                onChange={this.handleBulkActionChange}
                className="mr-2"
              >
                <Option value="bulk-actions">Bulk Actions</Option>
                <Option value="delete">Move To Trash</Option>
              </Select>
              <Button htmlType="button" onClick={this.handleClickApply}>
                Apply
              </Button>
            </Col>
            <Col xs={13} md={13}>
              <Select
                defaultValue="All Categories"
                style={{ width: 160 }}
                onChange={this.handleChangeCategory}
                className="mr-2"
              >
                <Option value="all">All Categories</Option>
                {categories.map(category => (
                  <Option key={category.id} value={category.id}>
                    {category.name}
                  </Option>
                ))}
              </Select>
              <Button htmlType="button" onClick={this.handleClickFilter}>
                Filter
              </Button>
            </Col>
          </Col>
        </Row>
        <br />
        <Row>
          <Col xs={24} md={24}>
            <div className="card">
              <div className="card-body">
                <Table
                  rowKey="id"
                  rowSelection={{ onChange: this.handleRowChange }}
                  columns={tableColumns}
                  dataSource={posts}
                  pagination={pagination}
                  loading={loading}
                  onChange={this.handleTableChange}
                />
              </div>
            </div>
          </Col>
        </Row>
      </Row>
    );
  }
}

export default AllPosts;
