import React from 'react';
import PropTypes from 'prop-types';

class SubTitle extends React.Component {
  render() {
    const { children } = this.props;
    return <p className="ant-upload-hint">{children}</p>;
  }
}

SubTitle.propTypes = {
  children: PropTypes.any,
};

export default SubTitle;
