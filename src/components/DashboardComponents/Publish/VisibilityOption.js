import React from 'react';
import PropTypes from 'prop-types';
import { Radio, Input } from 'antd';
import { getEvent } from 'utils/event';
import cn from 'classnames';

const RadioGroup = Radio.Group;

class VisibilityOption extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      hide: true,
    };
  }

  handleChange = event => {
    const hide = !(event.target.value === 'password');
    this.setState({ hide });
    this.props.onChange(event);
  };

  render() {
    const { hide } = this.state;
    const { password, onPassword } = this.props;

    const radioStyle = {
      display: 'block',
      height: '30px',
      lineHeight: '30px',
    };

    return (
      <RadioGroup name="visibility" onChange={this.handleChange} defaultValue="public">
        <Radio style={radioStyle} value="public">
          Public
        </Radio>
        <Radio style={radioStyle} value="password">
          Password Protected
        </Radio>
        <div className={cn({ hide })}>
          <p>Password:</p>
          <Input name="password" value={password} onChange={onPassword} />
        </div>
        <Radio style={radioStyle} value="private">
          Private
        </Radio>
      </RadioGroup>
    );
  }
}

VisibilityOption.propTypes = {
  password: PropTypes.string,
  onChange: PropTypes.func,
  onPassword: PropTypes.func,
};

VisibilityOption.defaultProps = {
  password: '',
  onChange: () => {},
  onPassword: () => {},
};

export default VisibilityOption;
