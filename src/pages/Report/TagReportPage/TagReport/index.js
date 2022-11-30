import React from 'react';
import { Table } from 'antd';
import { Row, Col } from 'antd';
import agent from 'utils/agent';
import { getUniqueDate } from 'utils/post';
import moment from 'moment/moment';
import { getOrderAbbreviation } from 'utils/abbreviation';
import { notification } from 'antd/lib/index';
import isEmpty from 'lodash/isEmpty';

class TagReport extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tags: [],
      loading: true,
      filter: {
        date: 'all',
        editor: 'all',
      },
      params: {
        select: 'name,slug',
        sort: 'createdAt DESC',
        populate: 'posts',
        omitPosts: 'true',
      },
      pagination: {},
    };

    this.getAllTagReports = this.getAllTagReports.bind(this);
    this.getTagReportByDate = this.getTagReportByDate.bind(this);
    this.getTagReportByEditor = this.getTagReportByEditor.bind(this);
    this.handleChangeDate = this.handleChangeDate.bind(this);
    this.handleChangeEditor = this.handleChangeEditor.bind(this);
    this.handleClickFilter = this.handleClickFilter.bind(this);
    this.handleTableChange = this.handleTableChange.bind(this);
    this.handleChangeSearch = this.handleChangeSearch.bind(this);
  }

  async componentDidMount() {
    await this.getAllTagReports();
  }

  async getAllTagReports() {
    this.setState({ loading: true });
    let { params } = this.state;
    let tags = [];
    let total = 0;

    try {
      let response = await agent.get('/reports/tag').query(params);
      tags = response.body.results;
      total = response.body.meta.totalCount;
    } catch (e) {
      notification.open({
        type: 'error',
        message: 'Error',
        description: 'Can not get list of tags',
      });
    }

    this.setState({
      tags: tags,
      loading: false,
      pagination: {
        total: total,
      },
    });
  }

  async getTagReportByDate(timestamp) {
    const { subParams } = this.state;
    let startDate = moment(timestamp)
      .startOf('day')
      .valueOf();
    let endDate = moment(timestamp)
      .endOf('day')
      .valueOf();

    let subParam = {
      ...subParams,
      where: {
        createdAt: {
          '>': startDate,
          '<=': endDate,
        },
      },
    };

    let self = this;
    this.setState({ subParams: subParam }, async () => {
      await self.getAllTagReports();
    });
  }

  async getTagReportByEditor(editor) {}

  handleChangeDate(value) {
    const { filter } = this.state;
    this.setState({
      filter: {
        ...filter,
        date: value,
      },
    });
  }

  handleChangeEditor(value) {
    const { filter } = this.state;
    this.setState({
      filter: {
        ...filter,
        editor: value,
      },
    });
  }

  async handleClickFilter() {
    let filter = this.state.filter;
    const { editor, date } = filter;

    if (editor === 'all' && date === 'all') {
      await this.getAllTagReports();
    }

    if (editor !== 'all') {
      await this.getTagReportByEditor(editor);
    }

    if (date !== 'all') {
      await this.getTagReportByDate(date);
    }
  }

  handleChangeSearch(tagsId) {
    const { params } = this.state;

    let param = {
      ...params,
      where: {
        id: tagsId,
      },
    };

    let self = this;
    this.setState({ params: param }, async () => {
      await self.getAllTagReports();
    });
  }

  async handleTableChange(pagination, filter, sorter) {
    let { params } = this.state;
    let order = getOrderAbbreviation(sorter.order);
    let field = sorter.field;

    // This for sort field
    let sort = field + ' ' + order;

    // This is for pagination
    let page = pagination.current;

    let param = {
      ...params,
      sort: sort,
      page: page,
    };

    // Replace sort when order is empty
    if (isEmpty(order)) {
      param.sort = params.sort;
    }

    this.setState(
      {
        params: param,
      },
      async () => {
        await this.getAllTagReports();
      },
    );
  }

  render() {
    const { tags, loading, pagination } = this.state;
    const tableColumns = [
      {
        title: 'Name',
        dataIndex: 'name',
        key: 'name',
      },
      {
        title: 'Count',
        dataIndex: 'count',
        key: 'count',
      },
    ];

    return (
      <Row>
        <div className="utils__title utils__title--flat mb-3">
          <span className="text-uppercase font-size-16">Tag Report</span>
        </div>
        <Row>
          <Col xs={24} md={24}>
            <div className="card">
              <div className="card-body">
                <Table
                  rowKey="id"
                  columns={tableColumns}
                  dataSource={tags}
                  loading={loading}
                  pagination={pagination}
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

export default TagReport;
