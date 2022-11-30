import React from 'react';
import PropTypes from 'prop-types';
import { notification, Checkbox, Row, Col } from 'antd';
import agent from 'utils/agent';
import isEmpty from 'lodash/isEmpty';
import { getEvent } from 'utils/event';

class Category extends React.Component {
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
      const items = response.body.results.filter(item => isEmpty(item.parent));
      this.setState({ items: items });
    } catch (e) {
      notification.open({
        type: 'error',
        message: 'Error',
        description: 'Can not get category',
      });
    }
  }

  render() {
    const { items } = this.state;
    const { onChange, name, value } = this.props;

    const checkboxGroupStyle = {
      width: '100%',
      maxHeight: '200px',
      overflow: 'scroll',
    };

    return (
      <Checkbox.Group
        style={checkboxGroupStyle}
        value={value}
        onChange={data => onChange(getEvent(name, data))}
      >
        {items.map(item => (
          <Row key={item.id}>
            <Col className="mt-2" span={16}>
              <Checkbox value={item.id}>{item.name}</Checkbox>
            </Col>
            <Col className="mt-2" span={16} offset={2}>
              {item.childs.map(child => (
                <Row key={child.id}>
                  <Col>
                    <Checkbox value={child.id}>{child.name}</Checkbox>
                  </Col>
                  <Col className="mt-2" span={16} offset={2}>
                    {child.childs &&
                      child.childs.map(item => (
                        <Row key={item.id}>
                          <Col>
                            <Checkbox value={item.id}>{item.name}</Checkbox>
                          </Col>
                        </Row>
                      ))}
                  </Col>
                </Row>
              ))}
            </Col>
          </Row>
        ))}
      </Checkbox.Group>
    );
  }
}

Category.propTypes = {
  params: PropTypes.object,
  endpoint: PropTypes.string,
  onChange: PropTypes.func,
  name: PropTypes.string,
  value: PropTypes.any,
};

Category.defaultProps = {
  params: {
    select: 'name, parent',
    populate: 'childs',
    perPage: '40',
  },
  name: 'categoriesId',
  endpoint: '/categories',
};

export default Category;
