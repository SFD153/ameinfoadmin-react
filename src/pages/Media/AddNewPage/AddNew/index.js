import React from 'react';
import { Button, Icon } from 'antd';
import { message, Upload } from 'antd/lib/index';
import { Link } from 'react-router-dom';

class AddNew extends React.Component {
  render() {
    const props = {
      name: 'media',
      multiple: true,
      action: process.env.REACT_APP_API_URL + '/medias',
      onChange(info) {
        const status = info.file.status;
        if (status === 'done') {
          message.success(`${info.file.name} file uploaded successfully.`);
        } else if (status === 'error') {
          message.error(`${info.file.name} file upload failed.`);
        }
      },
    };

    return (
      <div>
        <div className="utils__title utils__title--flat mb-3">
          <span className="text-uppercase font-size-16">Upload New Media</span>
        </div>
        <br />
        <Upload.Dragger {...props}>
          <p className="ant-upload-drag-icon">
            <Icon type="inbox" />
          </p>
          <p className="ant-upload-text">Drop files here</p>
          <p className="ant-upload-hint">or</p>
          <Button>Select Files</Button>
          <p className="ant-upload-hint">Maximum upload file size: 8 MB.</p>
        </Upload.Dragger>
      </div>
    );
  }
}

export default AddNew;
