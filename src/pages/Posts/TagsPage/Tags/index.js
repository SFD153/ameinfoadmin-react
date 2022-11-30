import React from 'react';
import { Form, Select, Button, Table, Input, Popconfirm } from 'antd';
import { Col, Row } from 'antd';
import { Link } from 'react-router-dom';
import agent from 'utils/agent';
import isEmpty from 'lodash/isEmpty';
import omit from 'lodash/omit';
import remove from 'lodash/remove';
import get from 'lodash/get';
import { getOrderAbbreviation } from 'utils/abbreviation';
import slugify from 'slug';
import { notification } from 'antd/lib/index';

const Option = Select.Option;
const { Search, TextArea } = Input;
const FormItem = Form.Item;

class Tags extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      keyword: '',
      tags: [],
      tagsId: [],
      action: '',
      loading: true,
      params: {
        select: 'name,slug',
        sort: 'createdAt DESC',
        populate: 'posts',
        omitPosts: 'true',
      },
      pagination: {},
      parent: 0,
    };
    this.handleSubmitForm = this.handleSubmitForm.bind(this);
    this.handleClickDelete = this.handleClickDelete.bind(this);
    this.handleClickSearch = this.handleClickSearch.bind(this);
    this.getAllTags = this.getAllTags.bind(this);
    this.handleTableChange = this.handleTableChange.bind(this);
    this.handleRowChange = this.handleRowChange.bind(this);
    this.handleBulkActionChange = this.handleBulkActionChange.bind(this);
    this.handleClickApply = this.handleClickApply.bind(this);
  }
  async componentDidMount() {
    let { params } = this.state;
    let tags = [];
    let total = 0;

    try {
      let response = await agent.get('/tags').query(params);
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

  async getAllTags() {
    this.setState({ loading: true });
    let { params, pagination } = this.state;
    let total = get(pagination, 'total', 0);
    let tags = [];

    try {
      let response = await agent.get('/tags').query(params);
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
      await self.getAllTags();
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

    let self = this;
    this.setState(
      {
        params: param,
      },
      async () => {
        await self.getAllTags();
      },
    );
  }

  async handleClickDelete(id) {
    let { tags, pagination } = this.state;
    let listOfTags = tags;

    try {
      await agent.delete(`/tags/${id}`);
      remove(listOfTags, tag => tag.id === id);
    } catch (e) {
      notification.open({
        type: 'error',
        message: 'Error',
        description: 'Can not delete tags',
      });
    }
    this.setState({
      tags: listOfTags,
      pagination: {
        total: pagination.total - 1,
      },
    });
  }

  async handleSubmitForm(event) {
    event.preventDefault();
    const { validateFields, resetFields } = this.props.form;
    validateFields(async (err, values) => {
      if (err) {
        return false;
      }

      const { tags, pagination } = this.state;
      const { name, slug, description } = values;

      let params = {
        name: name,
        slug: isEmpty(slug) ? slugify(name, { lower: true }) : slug,
        description: description,
      };

      try {
        await agent.post('/tags').send(params);
        tags.push(params);
      } catch (e) {
        notification.open({
          type: 'error',
          message: 'Error',
          description: 'Can not submit',
        });
      }

      this.setState({
        tags: tags,
        pagination: {
          total: pagination.total + 1,
        },
      });

      resetFields();
    });
  }

  handleRowChange(selectedRowKey) {
    this.setState({
      tagsId: selectedRowKey,
    });
  }
  handleBulkActionChange(value) {
    this.setState({
      action: value,
    });
  }

  async handleClickApply() {
    this.setState({ loading: true });
    let { tags, tagsId, action } = this.state;

    if (action !== 'delete') {
      return false;
    }
    let params = {
      tagsId: tagsId,
    };
    let listOfTags = tags;

    try {
      await agent.delete('/tags').send(params);
      tagsId.forEach(id => {
        remove(listOfTags, tag => tag.id === id);
      });
    } catch (e) {
      notification.open({
        type: 'error',
        message: 'Error',
        description: 'Can not delete permently tag',
      });
    }
    this.setState({
      tags: listOfTags,
      loading: false,
    });
  }

  render() {
    const { tags, loading, pagination } = this.state;
    const { getFieldDecorator } = this.props.form;
    const tableColumns = [
      {
        title: 'Name',
        dataIndex: 'name',
        key: 'name',
        width: '30%',
        sorter: true,
      },
      {
        title: 'Slug',
        dataIndex: 'slug',
        key: 'slug',
        width: '30%',
      },
      {
        title: 'Count',
        dataIndex: 'count',
        key: 'count',
        width: '20%',
        sorter: true,
      },
      {
        title: 'Action',
        dataIndex: 'action',
        key: 'action',
        width: '20%',
        render: (text, record) => {
          return (
            <div className="editable-row-operations">
              <Row>
                <Col md={5}>
                  <Link className="text-warning" to={'/posts/tags/edit-tag/' + record.id}>
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
      <div>
        <div className="utils__title utils__title--flat mb-3">
          <strong>Tags</strong>
        </div>
        <Col xs={24} md={10}>
          <Col xs={24} md={20}>
            <Row>
              <p>
                <strong>Add New Tag</strong>
              </p>
            </Row>
            <Form layout="vertical" onSubmit={this.handleSubmitForm}>
              <FormItem label="Name" extra="The name is how it appears on your site.">
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
              <FormItem
                label="Slug"
                extra="The “slug” is the URL-friendly version of the name. It is usually all lowercase and
                  contains only letters, numbers, and hyphens."
              >
                {getFieldDecorator('slug', {
                  initialValue: '',
                })(<Input />)}
              </FormItem>
              <FormItem
                label="Description"
                extra="The description is not prominent by default; however, some themes may show it."
              >
                {getFieldDecorator('description', {
                  initialValue: '',
                })(<TextArea rows={6} />)}
              </FormItem>
              <FormItem className="mt-4">
                <Button type="primary" htmlType="submit">
                  Add New Tag
                </Button>
              </FormItem>
            </Form>
          </Col>
        </Col>
        <Col xs={24} md={14}>
          <Row>
            <Col xs={17} md={18} />
            <Col xs={7} md={6}>
              <Search placeholder="search" onChange={this.handleClickSearch} />
            </Col>
          </Row>
          <Row>
            <Col xs={7} md={6}>
              <Select
                defaultValue="Bulk Actions"
                style={{ width: 120 }}
                onChange={this.handleBulkActionChange}
              >
                <Option value="bulk-actions">Bulk Actions</Option>
                <Option value="delete">Delete</Option>
              </Select>
            </Col>
            <Button onClick={this.handleClickApply}>Apply</Button>
          </Row>
          <br />
          <div className="card">
            <div className="card-body">
              <Table
                rowKey="id"
                rowSelection={{ onChange: this.handleRowChange }}
                columns={tableColumns}
                dataSource={tags}
                pagination={pagination}
                loading={loading}
                onChange={this.handleTableChange}
              />
            </div>
          </div>
          <Row>
            <Col xs={7} md={6}>
              <Select
                defaultValue="Bulk Actions"
                style={{ width: 120 }}
                onChange={this.handleBulkActionChange}
              >
                <Option value="bulk-actions">Bulk Actions</Option>
                <Option value="delete">Delete</Option>
              </Select>
            </Col>
            <Button onClick={this.handleClickApply}>Apply</Button>
          </Row>
          <br />
          <p>
            Tags can be selectively converted to categories using the
            <a href="#">tag to tag converter</a>.
          </p>
        </Col>
      </div>
    );
  }
}

export default Form.create()(Tags);
