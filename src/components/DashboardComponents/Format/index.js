import React from 'react';
import PropTypes from 'prop-types';
import { notification, Radio } from 'antd';
import agent from 'utils/agent';
import find from 'lodash/find';
import isEmpty from 'lodash/isEmpty';
import { getEvent } from 'utils/event';

const RadioGroup = Radio.Group;

class Format extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      items: [],
      itemId: '',
    };
  }

  async componentDidMount() {
    const { endpoint, params, onResult } = this.props;

    try {
      const response = await agent.get(endpoint).query(params);
      const items = response.body.results;
      const item = find(items, { name: 'standard' });
      const itemId = item.id;
      onResult(items);
      this.setState({ items: items, itemId: itemId });
    } catch (e) {
      notification.open({
        type: 'error',
        message: 'Error',
        description: 'Can not get format',
      });
    }
  }

  getIconBasedOnFormat(format) {
    let iconName;

    switch (format) {
      case 'gallery':
        iconName = 'icmn-images';
        break;
      case 'video':
        iconName = 'icmn-video-camera';
        break;
      case 'podcast':
        iconName = 'icmn-headphones';
        break;
      default:
        iconName = 'icmn-pushpin';
        break;
    }

    return iconName;
  }

  render() {
    const { items, itemId } = this.state;
    const { onChange, name, value } = this.props;

    const radioStyle = {
      display: 'block',
      height: '30px',
      lineHeight: '30px',
    };

    const radioValue = isEmpty(value) ? itemId : value;

    return (
      <RadioGroup onChange={data => onChange(getEvent(name, data))} value={radioValue}>
        {items.map(item => (
          <Radio className="mb-4" style={radioStyle} key={item.id} value={item.id}>
            <i className={this.getIconBasedOnFormat(item.name)}> {item.display}</i>
          </Radio>
        ))}
      </RadioGroup>
    );
  }
}

Format.propTypes = {
  params: PropTypes.object,
  endpoint: PropTypes.string,
  name: PropTypes.string,
  value: PropTypes.any,
  onChange: PropTypes.func,
  onResult: PropTypes.func,
};

Format.defaultProps = {
  params: {
    select: 'name,display',
  },
  endpoint: '/formats',
  name: 'formatId',
  onChange: () => {},
  onResult: () => {},
};

export default Format;
