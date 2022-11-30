import React from 'react';
import PropTypes from 'prop-types';
import { Select, notification } from 'antd';
import agent from 'utils/agent';
import { getEvent } from 'utils/event';

const { Option } = Select;

class Author extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
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
        description: 'Can not get author',
      });
    }
  }

  render() {
    const { items } = this.state;
    const { onChange, name, value } = this.props;
    return (
      <Select
        showSearch
        style={{ width: '100%' }}
        optionFilterProp="children"
        onChange={data => onChange(getEvent(name, data))}
        value={value}
      >
        {items.map(item => {
          return <Option key={item.id}>{item.username}</Option>;
        })}
      </Select>
    );
  }
}

Author.propTypes = {
  params: PropTypes.object,
  endpoint: PropTypes.string,
  onChange: PropTypes.func,
  name: PropTypes.string,
  value: PropTypes.any,
};

Author.defaultProps = {
  params: {
    select: 'username',
    perPage: '200',
    sort: 'username ASC',
  },
  endpoint: '/users',
  name: 'userId',
};

export default Author;
