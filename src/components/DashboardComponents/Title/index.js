import React from 'react';
import PropTypes from 'prop-types';

class Title extends React.Component {
  render() {
    const { children } = this.props;
    return (
      <div className="utils__title utils__title--flat mb-3">
        <strong>{children}</strong>
      </div>
    );
  }
}

Title.propTypes = {
  children: PropTypes.any,
};

export default Title;
