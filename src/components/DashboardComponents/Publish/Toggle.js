import React from 'react';
import PropTypes from 'prop-types';
import { Select, Col, Row, Button } from 'antd';
import { getEvent } from 'utils/event';
import cn from 'classnames';

const { Option } = Select;

class Toggle extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      toggle: false,
    };
  }

  handleClickToggle = () => {
    this.setState({ toggle: !this.state.toggle });
  };

  handleClickOk = () => {
    this.handleClickToggle();
    this.props.onOk();
  };

  handleClickCancel = () => {
    this.handleClickToggle();
    this.props.onCancel();
  };

  render() {
    const { toggle } = this.state;
    const { title, description, icon, disableEdit, children } = this.props;

    const hide = !toggle;
    return (
      <Row>
        <Col xs={2} md={2}>
          <i className={icon}> </i>
        </Col>
        <p>
          {title}: <strong>{description}</strong>&nbsp;
          <a
            className={cn({
              'text-primary': true,
              hide: disableEdit,
            })}
            onClick={this.handleClickToggle}
          >
            Edit
          </a>
        </p>
        <div className={cn({ hide })}>
          <Row>{children}</Row>
          <Row className="mt-2">
            <Button onClick={this.handleClickOk}>OK</Button>
            &nbsp;
            <a className="text-primary" onClick={this.handleClickCancel}>
              Cancel
            </a>
          </Row>
          <br />
        </div>
      </Row>
    );
  }
}

Toggle.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  icon: PropTypes.string.isRequired,
  disableEdit: PropTypes.bool,
  onChange: PropTypes.func,
  onOk: PropTypes.func,
  onCancel: PropTypes.func,
};

Toggle.defaultProps = {
  disableEdit: false,
  onChange: () => {},
  onOk: () => {},
  onCancel: () => {},
};

export default Toggle;
