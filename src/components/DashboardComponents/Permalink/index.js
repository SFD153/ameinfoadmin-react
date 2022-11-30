import React from 'react';
import PropTypes from 'prop-types';
import { Input, Button, Row } from 'antd';
import { getEvent } from 'utils/event';
import isEmpty from 'lodash/isEmpty';
import cn from 'classnames';

class Permalink extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      toggle: false,
    };
  }

  handleClickToggle = () => {
    this.setState({ toggle: !this.state.toggle });
  };

  render() {
    const { toggle } = this.state;
    const { name, value, type, permalink, onChange, onOk, onCancel, onEdit } = this.props;
    let previewURL = process.env.REACT_APP_WEB_URL + `/${type}/` + value;

    if (type === 'video') {
      previewURL = process.env.REACT_APP_WEB_URL + `/${type}/preview/` + value;
    }

    if (!isEmpty(permalink)) {
      previewURL = process.env.REACT_APP_WEB_URL + permalink;
    }

    return (
      <Row>
        <strong className="mr-2">Permalink:</strong>
        {toggle ? (
          <div style={{ display: 'inline-block' }}>
            <div style={{ display: 'inline-block' }}>
              <Input size="small" name={name} value={value} onChange={onChange} />
            </div>
            <div style={{ display: 'inline-block' }}>
              <Button
                size="small"
                onClick={() => {
                  this.handleClickToggle();
                  onOk();
                }}
              >
                OK
              </Button>
              <a
                className="text-primary"
                onClick={() => {
                  this.handleClickToggle();
                  onCancel();
                }}
              >
                Cancel
              </a>
            </div>
          </div>
        ) : (
          <div style={{ display: 'inline-block' }}>
            <a href={previewURL} target="_blank">
              {value}
            </a>
            &nbsp;
            <Button
              onClick={() => {
                this.handleClickToggle();
                onEdit();
              }}
              size="small"
            >
              Edit
            </Button>
          </div>
        )}
      </Row>
    );
  }
}

Permalink.propTypes = {
  name: PropTypes.string,
  type: PropTypes.string,
  value: PropTypes.string,
  permalink: PropTypes.string,
  onChange: PropTypes.func,
  onOk: PropTypes.func,
  onCancel: PropTypes.func,
  onEdit: PropTypes.func,
};

Permalink.defaultProps = {
  name: 'slug',
  type: 'post',
  value: '',
  permalink: '',
  onChange: () => {},
  onOk: () => {},
  onCancel: () => {},
  onEdit: () => {},
};

export default Permalink;
