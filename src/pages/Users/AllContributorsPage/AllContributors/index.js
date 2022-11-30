import React, { Fragment } from 'react';
import { Table, Button, Input, Select, notification, Popconfirm, Divider, Row, Col } from 'antd';
import { Link } from 'react-router-dom';
import agent from 'utils/agent';
import isEmpty from 'lodash/isEmpty';
import remove from 'lodash/remove';
import { getOrderAbbreviation } from 'utils/abbreviation';
import omit from 'lodash/omit';

const Search = Input.Search;
const Option = Select.Option;
const contributorRoles = ['5c2d0fde874fecb7a145b25f', '5c2d0fde874fecb7a145b25e'];

class AllContributors extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      users: [],
      usersId: [],
      action: '',
      userGroups: [],
      pagination: {},
      roles: [],
      params: {
        select: 'username,email,firstName,lastName',
        populate: 'role',
        sort: 'username ASC',
      },
      roleParams: {
        select: 'display',
      },
    };

    this.handleClickDelete = this.handleClickDelete.bind(this);
    this.handleRowChange = this.handleRowChange.bind(this);
    this.handleBulkActionChange = this.handleBulkActionChange.bind(this);
    this.handleClickApply = this.handleClickApply.bind(this);
    this.handleClickSearch = this.handleClickSearch.bind(this);
    this.handleChangeRole = this.handleChangeRole.bind(this);
    this.handleClickChange = this.handleClickChange.bind(this);
    this.handleTableChange = this.handleTableChange.bind(this);
  }

  async componentDidMount() {
    let { params, count, roleParams } = this.state;
    let users = [];
    let total = 0;
    let countData = count;
    let roles = [];
    let userGroups = [];

    try {
      let response = await agent.get('/roles').query(roleParams);
      roles = response.body.results;
      // filter roles
      roles = roles.filter(u => contributorRoles.includes(u.id));
    } catch (e) {
      notification.open({
        type: 'error',
        message: 'Error',
        description: 'Can not get list of roles',
      });
    }

    try {
      let query = {
        ...params,
        page: 1,
        where: {
          role: contributorRoles,
        },
      };
      let response = await agent.get('/users').query(query);
      users = response.body.results;
      total = response.body.meta.totalCount;
    } catch (e) {
      notification.open({
        type: 'error',
        message: 'Error',
        description: 'Can not get list of users',
      });
    }

    try {
      let response = await agent.get('/users/group');
      userGroups = response.body;
      // remove All element
      const all = userGroups.shift();
      // no way to restrict query by role so must filter
      userGroups = userGroups.filter(u => contributorRoles.includes(u._id));
      // get and update All count
      total = userGroups.reduce((a, b) => a + b.count, 0);
      all.count = total;
      userGroups.unshift(all);
    } catch (e) {
      notification.open({
        type: 'error',
        message: 'Error',
        description: 'Can not get list of user groups',
      });
    }

    this.setState({
      users: users,
      loading: false,
      count: countData,
      userGroups: userGroups,
      pagination: {
        total: total,
      },
      roles: roles,
    });
  }

  async handleClickDelete(id) {
    try {
      await agent.delete(`/users/${id}`);
      let { users } = this.state;
      remove(users, user => user.id === id);
      this.setState({ users: users });
      notification.open({
        type: 'success',
        message: 'Success',
        description: 'Delete successfully',
      });
    } catch (e) {
      notification.open({
        type: 'error',
        message: 'Error',
        description: 'Can not delete user',
      });
    }
  }

  handleRowChange(selectedRowKey) {
    this.setState({
      usersId: selectedRowKey,
    });
  }

  handleBulkActionChange(value) {
    this.setState({
      action: value,
    });
  }

  async handleClickApply() {
    this.setState({ loading: true });
    let { users, usersId, action } = this.state;

    if (action !== 'delete') {
      return false;
    }

    let params = {
      usersId: usersId,
    };

    let listOfUser = users;
    try {
      await agent.delete('/users').send(params);
      usersId.forEach(id => {
        remove(listOfUser, user => user.id === id);
      });
    } catch (e) {
      notification.open({
        type: 'error',
        message: 'Error',
        description: 'Can not delete permently user',
      });
    }

    this.setState({
      users: listOfUser,
      loading: false,
    });
  }

  async getAllContributors() {
    this.setState({ loading: true });

    let users = [];
    let { params } = this.state;

    // add roles to query
    params.where = params.where || {};
    params.where.role = contributorRoles;
    let total = 0;

    try {
      let response = await agent.get('/users').query(params);
      users = response.body.results;
      total = response.body.meta.totalCount;
    } catch (e) {
      notification.open({
        type: 'error',
        message: 'Error',
        description: 'Can not get list of users',
      });
    }

    this.setState({
      params: params,
      users: users,
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
      username: {
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
      await self.getAllContributors();
    });
  }

  handleChangeRole(value) {
    const { filter } = this.state;
    this.setState({
      filter: {
        ...filter,
        role: value,
      },
    });
  }

  async getUsersByRole(roleId) {
    this.setState({ loading: true });

    let { users, params } = this.state;
    let listOfUsers = users;
    let total = 0;

    let query = {
      ...params,
      page: 1,
      where: {
        role: roleId ? roleId : contributorRoles,
      },
    };

    try {
      let response = await agent.get('/users').query(query);
      listOfUsers = response.body.results;
      total = response.body.meta.totalCount;
    } catch (e) {
      notification.open({
        type: 'error',
        message: 'Error',
        description: 'Can not get user by role',
      });
    }

    this.setState({
      params: query,
      users: listOfUsers,
      loading: false,
      pagination: {
        total: total,
      },
    });
  }

  async handleClickChange() {
    const role = this.state.filter.role;

    if (role === 'change-role') {
      await this.setState(
        {
          params: {
            select: 'username,email,firstName,lastName',
            populate: 'role',
            sort: 'username ASC',
          },
        },
        async () => {
          await this.getAllContributors();
        },
      );
    } else {
      await this.getUsersByRole(role);
    }
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
      param.sort = params.sort;
    }

    this.setState({ params: param }, async () => {
      await this.getAllContributors();
    });
  }

  render() {
    const { users, userGroups, loading, roles, pagination } = this.state;
    const tableColumns = [
      {
        title: 'Username',
        dataIndex: 'username',
        key: 'username',
      },
      {
        title: 'Name',
        dataIndex: 'name',
        key: 'name',
        render: function(text, record) {
          let name = record.firstName + ' ' + record.lastName;
          if (isEmpty(record.fistName) && isEmpty(record.lastName)) {
            name = '—';
          }

          return name;
        },
      },
      {
        title: 'Email',
        dataIndex: 'email',
        key: 'email',
      },
      {
        title: 'Role',
        dataIndex: 'role.display',
        key: 'role.display',
      },
      {
        title: 'Action',
        dataIndex: 'action',
        key: 'action',
        render: (text, record) => {
          return (
            <div className="editable-row-operations">
              <Row>
                <Col md={5}>
                  <Link className="text-warning" to={'/users/edit-contributor/' + record.id}>
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
      <Col>
        <div className="utils__title utils__title--flat mb-3">
          <span className="text-uppercase font-size-16">Contributors and Authors</span>
          <Link to="/users/add-contributor">
            <Button className="ml-3">Add New</Button>
          </Link>
        </div>
        <Row>
          <Col xs={17} md={19}>
            {userGroups.map(userGroup => (
              <Fragment>
                <a
                  href="javascript:void(0)"
                  onClick={async () => await this.getUsersByRole(userGroup.role._id)}
                >
                  {userGroup.role.display} ({userGroup.count})
                </a>
                <Divider type="vertical" />
              </Fragment>
            ))}
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
              <Button onClick={this.handleClickApply}>Apply</Button>
            </Col>
            <Col s={13} md={13}>
              <Select
                defaultValue="Change role to..."
                style={{ width: 120 }}
                onChange={this.handleChangeRole}
                className="mr-2"
              >
                <Option value="change-role">Change to role...</Option>
                {roles.map(role => {
                  return (
                    <Option key={role.id} value={role.id}>
                      {role.display}
                    </Option>
                  );
                })}
              </Select>
              <Button onClick={this.handleClickChange}>Change</Button>
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
                  dataSource={users}
                  pagination={pagination}
                  loading={loading}
                  onChange={this.handleTableChange}
                />
              </div>
            </div>
          </Col>
        </Row>
      </Col>
    );
  }
}

export default AllContributors;
