import React from 'react';
import { Row, Col } from 'antd';
import { Input, Select, Button, Table, Form, notification, Popconfirm } from 'antd';
import { Link } from 'react-router-dom';
import agent from 'utils/agent';
import isEmpty from 'lodash/isEmpty';
import remove from 'lodash/remove';
import { getOrderAbbreviation } from 'utils/abbreviation';
import omit from 'lodash/omit';
import get from 'lodash/get';
import slugify from 'slug';

const { Option } = Select;
const { Search, TextArea } = Input;
const FormItem = Form.Item;

class Categories extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      keyword: '',
      parentId: '',
      categories: [],
      categoriesId: [],
      parents: [],
      loading: true,
      params: {
        select: 'name,slug,parent,count',
        perPage: '40',
      },
      pagination: {},
      action: '',
    };
    this.handleSubmitForm = this.handleSubmitForm.bind(this);
    this.handleClickDelete = this.handleClickDelete.bind(this);
    this.handleClickSearch = this.handleClickSearch.bind(this);
    this.handleTableChange = this.handleTableChange.bind(this);
    this.getAllCategories = this.getAllCategories.bind(this);
    this.handleBulkActionChange = this.handleBulkActionChange.bind(this);
    this.handleClickApply = this.handleClickApply.bind(this);
    this.handleRowChange = this.handleRowChange.bind(this);
  }

  async componentDidMount() {
    let { params } = this.state;
    let categories = [];
    let parents = [];
    let total = 0;

    try {
      let response = await agent.get('/categories').query(params);
      let items = response.body.results;
      total = response.body.meta.totalCount;
      parents = items.filter(item => isEmpty(item.parent));

      parents.forEach(parent => {
        const { id } = parent;
        categories.push(parent);
        const childs = items.filter(item => item.parent === id);
        childs.forEach(child => categories.push(child));
      });
    } catch (e) {
      notification.open({
        type: 'error',
        message: 'Error',
        description: 'Can not get suggestion list of categories',
      });
    }

    this.setState({
      categories: categories,
      parents: parents,
      loading: false,
      pagination: {
        total: total,
      },
    });
  }

  async getAllCategories() {
    this.setState({ loading: true });
    let { params, pagination } = this.state;
    let total = get(pagination, 'total', 0);
    let categories = [];

    try {
      const response = await agent.get('/categories').query(params);
      categories = response.body.results;
      total = response.body.meta.totalCount;
    } catch (e) {
      notification.open({
        type: 'error',
        message: 'Error',
        description: 'Can not get list of categories',
      });
    }

    this.setState({
      categories: categories,
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
      await self.getAllCategories();
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

    // Replace exist sort when order is empty
    if (isEmpty(order)) {
      param.sort = params.sort;
    }

    let self = this;
    this.setState({ params: param }, async () => {
      await self.getAllCategories();
    });
  }

  async handleClickDelete(id) {
    let { categories, pagination } = this.state;
    let listOfCategories = categories;

    try {
      await agent.delete(`/categories/${id}`);
      remove(listOfCategories, category => category.id === id);
      notification.open({
        type: 'success',
        message: 'Success',
        description: 'Delete successfully',
      });
    } catch (e) {
      notification.open({
        type: 'error',
        message: 'Error',
        description: 'Can not delete categories',
      });
    }

    this.setState({
      categories: listOfCategories,
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
      const { categories, pagination } = this.state;
      const { name, slug, title, parent, description } = values;

      let params = {
        name: name,
        slug: slug,
        title: title,
        description: description,
      };

      if (!isEmpty(parent) && parent !== 'none') {
        params.parent = parent;
      }

      try {
        await agent.post('/categories').send(params);
        categories.push(params);
        this.setState({
          categories: categories,
          pagination: {
            total: pagination.total + 1,
          },
        });
      } catch (e) {
        notification.open({
          type: 'error',
          message: 'Error',
          description: 'Can not submit',
        });
      }

      resetFields();
      window.location.reload();
    });
  }

  handleRowChange(selectedRowKey) {
    this.setState({
      categoriesId: selectedRowKey,
    });
  }

  handleBulkActionChange(value) {
    this.setState({
      action: value,
    });
  }

  async handleClickApply() {
    this.setState({ loading: true });

    let { categories, categoriesId, action } = this.state;

    if (action !== 'delete') {
      return false;
    }

    let params = {
      categoriesId: categoriesId,
    };

    let listOfCategories = categories;

    try {
      await agent.delete('/categories').send(params);
      categoriesId.forEach(id => {
        remove(listOfCategories, category => category.id === id);
      });
    } catch (e) {
      notification.open({
        type: 'error',
        message: 'Error',
        description: 'Can not delete categories',
      });
    }
    this.setState({
      categories: listOfCategories,
      loading: false,
    });
  }

  handleSubmit(e) {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        console.log('Received values of form: ', values);
      }
    });
  }

  async handleBlurTitle(e) {
    const title = e.target.value;
    const slug = slugify(title, { lower: true });
    const {
      form: { setFieldsValue },
    } = this.props;
    setFieldsValue({ slug });
  }

  render() {
    const { parents, categories, loading } = this.state;
    const { getFieldDecorator } = this.props.form;

    const tableColumns = [
      {
        title: 'Name',
        dataIndex: 'name',
        key: 'name',
        width: '30%',
        sorter: true,
        render: (text, record) => {
          if (isEmpty(record.parent)) {
            return record.name;
          } else {
            return `— ${record.name}`;
          }
        },
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
                  <Link
                    className="text-warning"
                    to={'/posts/categories/edit-category/' + record.id}
                  >
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
        <div className="utils__title utils__title--flat mb-3">
          <strong>Categories</strong>
        </div>
        <Col xs={24} md={10}>
          <Col xs={24} md={20}>
            <p>
              <strong>Add New Category</strong>
            </p>
            <Form layout="vertical" onSubmit={this.handleSubmitForm}>
              <FormItem label="Name" extra="The name is how it appears on your site.">
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
                label="Parent Category"
                extra="Categories, unlike tags, can have a hierarchy. You might have a Jazz category, and
              under that have children categories for Bebop and Big Band. Totally optional."
              >
                {getFieldDecorator('parent', {
                  initialValue: 'none',
                })(
                  <Select style={{ width: 200 }}>
                    {parents.map(category => (
                      <Option key={category.name} value={category.id}>
                        {category.name}
                      </Option>
                    ))}
                  </Select>,
                )}
              </FormItem>
              <FormItem
                label="Title"
                extra="The title is not prominent by default; however, some themes may show it."
              >
                {getFieldDecorator('title', {
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
                  Add New Category
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
                expandRowByClick={false}
                dataSource={categories}
                pagination={false}
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
            <strong>Note:</strong>
          </p>
          <p>
            Deleting a category does not delete the posts in that category. Instead, posts that were
            only assigned to the deleted category are set to the category
            <strong>Uncategorized</strong>.
          </p>
        </Col>
      </Row>
    );
  }
}

export default Form.create()(Categories);
