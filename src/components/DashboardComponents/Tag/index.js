import React from 'react';
import PropTypes from 'prop-types';
import { Select, notification, Spin } from 'antd';
import agent from 'utils/agent';
import isEmpty from 'lodash/isEmpty';
import uniqid from 'uniqid';
import { getEvent } from 'utils/event';

const { Option } = Select;

class Tag extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      items: [],
    };
  }

  async componentDidMount() {
    const { endpoint, params } = this.props;
    try {
      const response = await agent.get(endpoint).query(params);
      this.setState({ items: response.body.results });
    } catch (e) {
      notification.open({
        type: 'error',
        message: 'Error',
        description: 'Can not get tag',
      });
    }
  }

  handleSearch = async keyword => {
    this.setState({ loading: true, items: [] });
    const { endpoint, params } = this.props;
    let items = [];
    params.where = {
      name: {
        like: `%${keyword}%`,
      },
    };

    try {
      let response = await agent.get(endpoint).query(params);
      items = response.body.results;

      const isExist = items.some(item => item.name === keyword);
      if (!isExist && !isEmpty(keyword)) {
        items.unshift({ id: `empty-${uniqid()}`, name: keyword });
      }
    } catch (e) {
      notification.open({
        type: 'error',
        message: 'Error',
        description: e.message,
      });
    }

    this.setState({ loading: false, items: items });
  };

  render() {
    const { items } = this.state;
    const { loading, onChange, name, value } = this.props;
    return (
      <Select
        mode="multiple"
        tokenSeparators={[',']}
        placeholder="Select tag"
        labelInValue
        filterOption={false}
        value={value}
        onChange={data => onChange(getEvent(name, data))}
        onSearch={this.handleSearch}
        notFoundContent={loading ? <Spin size="small" /> : null}
        style={{ width: '100%' }}
      >
        {items.map(item => (
          <Option key={item.id} value={item.id}>
            {item.name}
          </Option>
        ))}
      </Select>
    );
  }
}

Tag.propTypes = {
  params: PropTypes.object,
  endpoint: PropTypes.string,
  onChange: PropTypes.func,
  name: PropTypes.string,
  value: PropTypes.any,
};

Tag.defaultProps = {
  params: {
    select: 'name',
    sort: 'createdAt DESC',
  },
  endpoint: '/tags',
  name: 'selectedTags',
};

export default Tag;
