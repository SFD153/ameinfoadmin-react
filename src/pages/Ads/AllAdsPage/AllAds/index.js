import React from 'react';
import { Table, Button, Input, Select, Popconfirm } from 'antd';
import { Row, Col } from 'antd';
import { Link } from 'react-router-dom';
import agent from 'utils/agent';
import { notification } from 'antd/lib/index';
import moment from 'moment/moment';
import { getOrderAbbreviation } from 'utils/abbreviation';
import isEmpty from 'lodash/isEmpty';
import omit from 'lodash/omit';
import get from 'lodash/get';
import remove from 'lodash/remove';
import flattenDeep from 'lodash/flattenDeep';
import capitalize from 'lodash/capitalize';

const Search = Input.Search;
const Option = Select.Option;

class AllAds extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      ads: [],
      adsId: [],
      loading: true,
      params: {
        select: 'name,showOn,createdAt',
        populate: 'meta',
        sort: 'createdAt DESC',
      },
      action: '',
      filter: '',
      pagination: {},
    };

    this.getAllAds = this.getAllAds.bind(this);
    this.handleClickDelete = this.handleClickDelete.bind(this);
    this.handleClickSearch = this.handleClickSearch.bind(this);
    this.handleTableChange = this.handleTableChange.bind(this);
    this.handleRowChange = this.handleRowChange.bind(this);
    this.handleBulkActionChange = this.handleBulkActionChange.bind(this);
    this.handleClickApply = this.handleClickApply.bind(this);
    this.handleClickStatus = this.handleClickStatus.bind(this);
    this.handleChangeFilter = this.handleChangeFilter.bind(this);
  }

  async componentDidMount() {
    let { params, count } = this.state;
    let ads = [];
    let total = 0;
    let countData = count;

    try {
      let response = await agent.get('/ads').query(params);
      let responseCount = await agent.get('/ads/count');
      ads = response.body.results;
      total = response.body.meta.totalCount;
      countData = responseCount.body;
    } catch (e) {
      notification.open({
        type: 'error',
        message: 'Error',
        description: 'Can not get list of ads',
      });
    }

    this.setState({
      ads: ads,
      loading: false,
      count: countData,
      pagination: {
        total: total,
      },
    });
  }

  handleRowChange(selectedRowKey) {
    this.setState({
      adsId: selectedRowKey,
    });
  }

  handleTableChange(pagination, filters, sorter) {
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
      param.sort = params.sort;
    }

    let self = this;
    this.setState({ params: param }, async () => {
      await self.getAllAds();
    });
  }

  async getAllAds() {
    this.setState({ loading: true });

    let { params, pagination } = this.state;
    let ads = [];
    let total = get(pagination, 'total', 0);

    try {
      let response = await agent.get('/ads').query(params);
      ads = response.body.results;
      total = response.body.meta.totalCount;
    } catch (e) {
      notification.open({
        type: 'error',
        message: 'Error',
        description: 'Can not get list of ads',
      });
    }

    this.setState({
      ads: ads,
      loading: false,
      pagination: {
        total: total,
      },
    });
  }

  async handleClickSearch(value) {
    let { params } = this.state;
    let where = {
      name: {
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
      await self.getAllAds();
    });
  }

  async handleClickDelete(id) {
    let { ads } = this.state;
    let listOfAds = ads;

    try {
      await agent.delete(`/ads/${id}`);
      remove(listOfAds, ad => ad.id === id);
      notification.open({
        type: 'success',
        message: 'Success',
        description: 'Delete ad successfully',
      });
    } catch (e) {
      notification.open({
        type: 'error',
        message: 'Error',
        description: 'Can not delete ad',
      });
    }

    this.setState({
      ads: listOfAds,
    });
  }

  async handleClickStatus(status) {
    let { count, params } = this.state;
    let where = {
      status: status,
    };

    if (isEmpty(status)) {
      where = null;
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
      await self.getAllAds();
    });
  }

  handleChangeFilter(filter) {
    this.setState({ filter });
  }

  handleBulkActionChange(value) {
    this.setState({
      action: value,
    });
  }

  async handleClickApply() {
    this.setState({ loading: true });
    let { ads, adsId, action } = this.state;

    if (action !== 'delete') {
      return false;
    }
    let params = {
      adsId: adsId,
    };
    let listOfAds = ads;

    try {
      await agent.delete('/ads').send(params);
      adsId.forEach(id => {
        remove(listOfAds, ad => ad.id === id);
      });
    } catch (e) {
      notification.open({
        type: 'error',
        message: 'Error',
        description: 'Can not delete ad permently',
      });
    }
    this.setState({
      ads: listOfAds,
      loading: false,
    });
  }

  render() {
    const { ads, pagination, loading } = this.state;
    const tableColumns = [
      {
        title: 'Name',
        dataIndex: 'name',
        key: 'name',
        sorter: true,
      },
      {
        title: 'Show On',
        dataIndex: 'showOn',
        key: 'showOn',
        render: (text, record) => {
          return capitalize(record.showOn.split('-').join(' '));
        },
      },
      {
        title: 'Date',
        dataIndex: 'Date',
        key: 'Date',
        render: (text, record) => {
          let date;
          if (record.createdAt === record.updatedAt) {
            date = record.createdAt;
          } else {
            date = record.updatedAt;
          }

          return (
            <div className="date">
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
        width: '10%',
        render: (text, record) => {
          return (
            <div className="editable-row-operations">
              <Row>
                <Col md={5}>
                  <Link className="text-warning" to={'/ads/edit-ad/' + record.id}>
                    <i className="fa fa-edit" />
                  </Link>
                </Col>
                <Col md={4}>
                  <Popconfirm
                    title="Sure to delete?"
                    onConfirm={() => this.handleClickDelete(record.id)}
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
        <Col>
          <div className="utils__title utils__title--flat mb-3">
            <span className="text-uppercase font-size-16">Ads</span>
            <Link to="/ads/add-new">
              <Button className="ml-3">Add New</Button>
            </Link>
          </div>
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
            <Col xs={7} md={5}>
              <Search placeholder="search" onSearch={this.handleClickSearch} enterButton />
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
                    dataSource={ads}
                    pagination={pagination}
                    loading={loading}
                    onChange={this.handleTableChange}
                  />
                </div>
              </div>
            </Col>
          </Row>
        </Col>
      </Row>
    );
  }
}

export default AllAds;
