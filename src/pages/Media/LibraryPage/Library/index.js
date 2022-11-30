import React from 'react';
import { Button, Table, Popconfirm } from 'antd';
import { Row, Col } from 'antd';
import { Input } from 'antd/lib/index';
import agent from 'utils/agent';
import moment from 'moment/moment';
import prettyBytes from 'pretty-bytes';
import omit from 'lodash/omit';
import isEmpty from 'lodash/isEmpty';
import { getOrderAbbreviation } from 'utils/abbreviation';
import { notification } from 'antd/lib/index';
import { Link } from 'react-router-dom';

const Search = Input.Search;

class Library extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      mediasId: [],
      medias: [],
      loading: true,
      params: {
        select: 'mime,name,updatedAt,size,link',
        sort: 'createdAt DESC',
      },
      pagination: {},
    };

    this.handleClick = this.handleClick.bind(this);
    this.getAllMedias = this.getAllMedias.bind(this);
    this.handleTableChange = this.handleTableChange.bind(this);
    this.handleClickSearch = this.handleClickSearch.bind(this);
  }

  async componentDidMount() {
    await this.getAllMedias();
  }

  async getAllMedias() {
    this.setState({ loading: true });

    let { medias, params } = this.state;
    let total = 0;

    try {
      let response = await agent.get('/medias').query(params);
      medias = response.body.results;
      total = response.body.meta.totalCount;
    } catch (e) {
      notification.open({
        type: 'error',
        message: 'Error',
        description: 'Can not get list of medias',
      });
    }

    this.setState({
      medias: medias,
      loading: false,
      pagination: {
        total: total,
      },
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
      await self.getAllMedias();
    });
  }

  handleClick() {
    this.setState({
      display: 'table',
    });
  }

  async handleClickSearch(event) {
    let value = event.target.value;

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
      await self.getAllMedias();
    });
  }

  render() {
    const { medias, pagination, loading } = this.state;

    const tableColumns = [
      {
        title: 'Preview',
        dataIndex: 'mime',
        key: 'mime',
        width: '7%',
        render: (text, record) => {
          return <img width={60} height={60} src={record.link} alt={record.name} />;
        },
      },
      {
        title: 'Name',
        dataIndex: 'name',
        key: 'name',
        render: (text, record) => {
          return (
            <a href={record.link} target="_blank">
              {record.name}
            </a>
          );
        },
      },
      {
        title: 'Updated',
        dataIndex: 'updatedAt',
        key: 'updatedAt',
        width: '15%',
        render: (text, record) => {
          let date;
          if (record.createdAt === record.updatedAt) {
            date = record.createdAt;
          } else {
            date = record.updatedAt;
          }
          return moment(date).format('YYYY/MM/DD - HH:mm');
        },
      },
      {
        title: 'Size',
        dataIndex: 'size',
        key: 'size',
        render: (text, record) => {
          return prettyBytes(record.size);
        },
      },
      {
        title: 'Action',
        key: 'action',
        width: '10%',
        render: (text, record) => {
          return (
            <div className="editable-row-operations">
              <Row>
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
      <div>
        <div className="utils__title utils__title--flat mb-3">
          <Row>
            <Col xs={17} md={19}>
              <span className="text-uppercase font-size-16">Media</span>
              <Link to={'/media/add-new'}>
                <Button className="ml-3">Add New</Button>
              </Link>
            </Col>
            <Col xs={7} md={5}>
              <Search placeholder="search" onChange={this.handleClickSearch} />
            </Col>
          </Row>
        </div>
        <br />
        <div className="card">
          <div className="card-body">
            <Table
              rowKey="id"
              columns={tableColumns}
              dataSource={medias}
              pagination={pagination}
              loading={loading}
              onChange={this.handleTableChange}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default Library;
