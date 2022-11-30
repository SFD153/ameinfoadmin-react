import React from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';
import isEmpty from 'lodash/isEmpty';

class WordCount extends React.Component {
  render() {
    const { help, max, word } = this.props;
    let count = isEmpty(word) ? 0 : word.length;
    return (
      <p className="mt-2 text-secondary font-italic">
        {help}
        <span className={cn({ 'text-danger': count > max })}>{count}</span>
      </p>
    );
  }
}

WordCount.propTypes = {
  help: PropTypes.string,
  word: PropTypes.string,
  max: PropTypes.number,
};

WordCount.defaultProps = {
  help: '',
  word: '',
  max: 0,
};

export default WordCount;
