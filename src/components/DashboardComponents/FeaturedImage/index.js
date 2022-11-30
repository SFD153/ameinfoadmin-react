import React from 'react';
import PropTypes from 'prop-types';
import { Row, Upload, Spin } from 'antd';
import isEmpty from 'lodash/isEmpty';

class FeaturedImage extends React.Component {
  render() {
    const { onChange, onRemove, loading, value, name, action } = this.props;

    if (!isEmpty(value)) {
      return (
        <div>
          <Row>
            <img style={{ width: '100%', height: '100%' }} src={value.link} alt="thumbnail" />
          </Row>
          <Row className="mt-4">
            <a href="javascript:void(0)" onClick={() => onRemove(value.id)}>
              Remove featured image
            </a>
          </Row>
        </div>
      );
    } else {
      return (
        <Upload name={name} showUploadList={false} action={action} onChange={onChange}>
          {loading ? <Spin /> : <a href="javascript:void(0)">Set featured image</a>}
        </Upload>
      );
    }
  }
}

FeaturedImage.propTypes = {
  name: PropTypes.string,
  action: PropTypes.string,
  loading: PropTypes.bool,
  value: PropTypes.any,
  onRemove: PropTypes.func,
  onChange: PropTypes.func,
};

FeaturedImage.defaultProps = {
  loading: false,
};

export default FeaturedImage;
