import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { Upload, message } from 'antd';
import Single from './Button/Single';
import Multiple from './Button/Multiple';
import { audioMime, videoMime, imageMime } from './mime';

class Attachment extends React.Component {
  constructor(props) {
    super(props);

    this.beforeUpload = this.beforeUpload.bind(this);
  }

  beforeUpload(file) {
    const { type } = this.props;
    const fileType = file.type;

    if (type === 'gallery' && !imageMime.includes(fileType)) {
      message.error('You can only upload Image file!');
      return false;
    }

    if (type === 'video' && !videoMime.includes(fileType)) {
      message.error('You can only upload Video file!');
      return false;
    }

    if (type === 'podcast' && !audioMime.includes(fileType)) {
      message.error('You can only upload Audio file!');
      return false;
    }
  }

  render() {
    const { type } = this.props;
    const singularType = ['video', 'podcast'];

    // Get list type
    let listType = null;
    if (type === 'gallery') {
      listType = 'picture-card';
    }

    // Get button
    let button = <Multiple />;
    if (singularType.includes(type)) {
      button = <Single />;
    }

    return (
      <Upload {...this.props} listType={listType} beforeUpload={this.beforeUpload}>
        {button}
      </Upload>
    );
  }
}

Attachment.propTypes = {
  type: PropTypes.string,
  listType: PropTypes.string,
  fileList: PropTypes.array,
};

Attachment.defaultProps = {
  type: 'gallery',
  listType: 'text',
  fileList: [],
};

export default Attachment;
