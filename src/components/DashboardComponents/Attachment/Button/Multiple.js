import React from 'react';
import { Icon } from 'antd';

class Multiple extends React.Component {
  render() {
    return (
      <div>
        <Icon type="plus" />
        <div className="ant-upload-text">Upload</div>
      </div>
    );
  }
}

export default Multiple;
