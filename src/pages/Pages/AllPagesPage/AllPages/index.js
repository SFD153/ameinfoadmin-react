import React from 'react';
import { Table, Button, Input, Select, notification, Popconfirm } from 'antd';
import { Divider } from 'antd';
import { Row, Col } from 'antd';
import { Link } from 'react-router-dom';
import agent from 'utils/agent';
import isEmpty from 'lodash/isEmpty';
import omit from 'lodash/omit';
import { getOrderAbbreviation } from 'utils/abbreviation';
import moment from 'moment';
import remove from 'lodash/remove';
import uniqBy from 'lodash/uniqBy';
import get from 'lodash/get';
import startCase from 'lodash/startCase';

const Search = Input.Search;
const Option = Select.Option;

class AllPages extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      pages: [],
      pagesId: [],
      loading: true,
      params: {
        select: 'title,createdAt,updatedAt,status',
        populate: 'user',
        sort: 'createdAt DESC',
        where: {
          status: ['publish', 'draft', 'pending', 'preview', 'private'],
        },
      },
      count: {
        total: 0,
        publish: 0,
        draft: 0,
        trash: 0,
      },
      action: '',
      filter: {
        date: 'all',
      },
      dates: [],
      pagination: {},
    };
    this.getAllPages = this.getAllPages.bind(this);
    this.handleClickDelete = this.handleClickDelete.bind(this);
    this.handleClickSearch = this.handleClickSearch.bind(this);
    this.handleTableChange = this.handleTableChange.bind(this);
    this.handleRowChange = this.handleRowChange.bind(this);
    this.handleClickStatus = this.handleClickStatus.bind(this);
    this.handleBulkActionChange = this.handleBulkActionChange.bind(this);
    this.handleClickApply = this.handleClickApply.bind(this);
    this.handleChangeDate = this.handleChangeDate.bind(this);
    this.handleClickFilter = this.handleClickFilter.bind(this);
  }

  async componentDidMount() {
    let { params, count } = this.state;
    let pages = [];
    let dates = [];
    let total = 0;
    let countData = count;
    let paramsDate = {
      select: 'createdAt',
    };

    try {
      let response = await agent.get('/pages').query(params);
      let responseCount = await agent.get('/pages/count');
      let responseDate = await agent.get('/pages').query(paramsDate);
      pages = response.body.results;
      total = response.body.meta.totalCount;
      countData = responseCount.body;
      dates = responseDate.body.results;
      dates = this.getUniqueDate(dates);
    } catch (e) {
      notification.open({
        type: 'error',
        message: 'Error',
        description: 'Can not get page',
      });
    }

    this.setState({
      pages: pages,
      loading: false,
      count: countData,
      dates: dates,
      pagination: {
        total: total,
      },
    });
  }

  getUniqueDate(dates) {
    let listOfDate = dates.map(date => {
      return {
        timestamp: date.createdAt,
        display: moment(date.createdAt)
          .locale('en')
          .format('MMMM YYYY'),
      };
    });
    return uniqBy(listOfDate, 'display');
  }

  async handleClickDelete(id) {
    let { pages } = this.state;
    let listOfPages = pages;

    try {
      await agent.delete(`/pages/${id}`);
      remove(listOfPages, page => page.id === id);
    } catch (e) {
      notification.open({
        type: 'error',
        message: 'Error',
        description: 'Can not delete page',
      });
    }
    this.setState({
      pages: listOfPages,
    });
  }

  async handleClickChangeStatus(id, status) {
    let { pages, count } = this.state;
    let listOfPage = pages;
    let updater = count;
    let message = '';

    try {
      // Base on status to move to trash or delete it
      switch (status) {
        case 'trash':
          await agent.delete(`/pages/${id}`);
          message = 'Deleted successfully';
          updater['trash']--;
          break;
        case 'draft':
        case 'publish':
        case 'scheduled':
        case 'pending':
        case 'private':
          await agent.put(`/pages/${id}/status/trash`);
          message = 'Move to trash successfully';
          updater[status]--;
          updater['trash']++;
          break;
        case 'restore':
          await agent.put(`/pages/${id}/status/draft`);
          message = 'Restore successfully';
          updater['draft']++;
          updater['trash']--;
          break;
        default:
          break;
      }

      remove(listOfPage, page => page.id === id);
      notification.open({
        type: 'success',
        message: 'Success',
        description: message,
      });
    } catch (e) {
      notification.open({
        type: 'error',
        message: 'Error',
        description: 'Can not change status',
      });
    }

    this.setState({
      pages: listOfPage,
    });
  }

  async getAllPages() {
    this.setState({ loading: true });
    let { params } = this.state;
    let pages = [];

    try {
      let response = await agent.get('/pages').query(params);
      pages = response.body.results;
    } catch (e) {
      notification.open({
        type: 'error',
        message: 'Error',
        description: 'Can not get list of pages',
      });
    }

    this.setState({
      pages: pages,
      loading: false,
    });
  }

  async handleClickSearch(event) {
    let value = event.target.value;

    let { params } = this.state;
    let where = {
      title: {
        like: `%${value}%`,
      },
    };

    let param = {
      ...params,
      where: where,
    };

    if (isEmpty(value)) {
      param = omit(param, 'where');
    }

    let self = this;
    this.setState({ params: param }, async () => {
      await self.getAllPages();
    });
  }

  async handleTableChange(pagination, filters, sorter) {
    let { params } = this.state;
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
      param = omit(param, 'sort');
    }

    let self = this;
    this.setState({ params: param }, async () => {
      await self.getAllPages();
    });
  }

  handleRowChange(selectedRowKey) {
    this.setState({
      pagesId: selectedRowKey,
    });
  }

  async handleClickStatus(status = null) {
    let { count, params } = this.state;
    let where = {
      status: status,
    };

    // This is status All
    if (isEmpty(status)) {
      where.status = {
        '!=': 'trash',
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
      await self.getAllPages();
    });
  }

  handleBulkActionChange(value) {
    this.setState({
      action: value,
    });
  }

  async handleClickApply() {
    let { pages, pagesId, action } = this.state;

    if (action !== 'delete') {
      return false;
    }

    let params = {
      pagesId: pagesId,
    };

    let listOfPages = pages;

    this.setState({ loading: true });
    try {
      await agent.delete('/pages').send(params);
      pagesId.forEach(id => {
        remove(listOfPages, page => page.id === id);
      });
    } catch (e) {
      notification.open({
        type: 'error',
        message: 'Error',
        description: 'Can not delete permently page',
      });
    }
    this.setState({
      pages: listOfPages,
      loading: false,
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

  async getPagesByDate(timestamp) {
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
      await self.getAllPages();
    });
  }

  async handleClickFilter() {
    let filter = this.state.filter;
    const { date } = filter;

    if (date === 'all') {
      await this.getAllPages();
    }

    if (date !== 'all') {
      await this.getPagesByDate(date);
    }
  }

  render() {
    const { pages, count, dates, pagination, loading, params } = this.state;
    const tableColumns = [
      {
        title: 'Title',
        dataIndex: 'title',
        key: 'title',
        sorter: true,
        render: (text, record) => {
          let status = record.status;

          if (status === 'publish') {
            status = '';
          }

          let prefix = ' — ';
          if (isEmpty(status)) {
            prefix = '';
          }

          return (
            <Link to={'/pages/edit-page/' + record.id}>
              {record.title}
              <span style={{ color: '#555', fontWeight: '600' }}>
                {prefix}
                {startCase(status)}
              </span>
            </Link>
          );
        },
      },
      {
        title: 'Author',
        dataIndex: 'user.username',
        key: 'user.username',
        render: (text, record) => {
          return isEmpty(record.user) ? '-' : record.user.username;
        },
      },
      {
        title: 'Date',
        dataIndex: 'date',
        key: 'date',
        sorter: true,
        render: (text, record) => {
          let date;
          if (record.createdAt === record.updatedAt) {
            date = record.createdAt;
          } else {
            date = record.updatedAt;
          }

          return (
            <div className="date">
              {record.createdAt === record.updatedAt ? 'Published' : 'Last Modified'}
              <br />
              <abbr title={moment(date).format('YYYY/MM/DD HH:mm:ss a')}>
                {moment(date).format('YYYY/MM/DD')}
              </abbr>
            </div>
          );
        },
      },
      {
        title: 'Action',
        dataIndex: 'action',
        key: 'action',
        render: (text, record) => {
          return (
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
                <Col md={5}>
                  <Link className="text-warning" to={'/pages/edit-page/' + record.id}>
                    <i className="fa fa-edit" />
                  </Link>
                </Col>
                <Col md={4}>
                  <Popconfirm
                    title="Sure to delete?"
                    onConfirm={() => this.handleClickChangeStatus(record.id, record.status)}
                  >
                    <a href="javascript:void(0)" className="text-danger">
                      <i className="fa fa-times" />
                    </a>
                  </Popconfirm>
                </Col>
              </Row>
            </div>
          );
        },
      },
    ];

    return (
      <Row>
        <div className="utils__title utils__title--flat mb-3">
          <span className="text-uppercase font-size-16">Pages</span>
          <Link to="/pages/add-new">
            <Button className="ml-3">Add New</Button>
          </Link>
        </div>
        <Row>
          <Col xs={17} md={19}>
            <a href="javascript:void(0)" onClick={() => this.handleClickStatus()}>
              <strong>All</strong> ({count.total})
            </a>
            {/*<Divider type="vertical" />*/}
            {/*<a href="javascript:void(0)" onClick={() => this.handleClickStatus('publish')}>*/}
            {/*Mine ({count.mine})*/}
            {/*</a>*/}
            <Divider type="vertical" />
            <a href="javascript:void(0)" onClick={() => this.handleClickStatus('publish')}>
              Published ({count.publish})
            </a>
            <Divider type="vertical" />
            <a href="javascript:void(0)" onClick={() => this.handleClickStatus('draft')}>
              Drafts ({count.draft})
            </a>
            <Divider type="vertical" />
            <a href="javascript:void(0)" onClick={() => this.handleClickStatus('trash')}>
              Trash ({count.trash})
            </a>
          </Col>
          <Col xs={7} md={5}>
            <Search placeholder="search" onChange={this.handleClickSearch} />
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
                <Option value="delete">Delete</Option>
              </Select>
              <Button htmlType="button" onClick={this.handleClickApply}>
                Apply
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
                  dataSource={pages}
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

export default AllPages;
