import React from 'react';
import PropTypes from 'prop-types';

class Appendix extends React.Component {
  render() {
    const { children } = this.props;
    return <p className="font-weight-bold">{children}</p>;
  }
}

Appendix.propTypes = {
  children: PropTypes.any,
};

export default Appendix;
