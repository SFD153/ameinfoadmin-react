import React from 'react';
import isEmpty from 'lodash/isEmpty';
import { Modal, Input, Row, Col } from 'antd';

export default class ModalUpdate extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      visible: false,
      title: '',
      url: '',
    };
  }

  showModal = () => {
    this.setState({
      visible: true,
      title: this.props.rowInfo.node.title,
      url: this.props.rowInfo.node.url,
    });
  };

  handleChange = e => {
    const { name, value } = e.target;
    this.setState({
      [name]: value,
    });
  };

  handleOk = () => {
    this.props.onEdit(this.state);
    this.setState({
      visible: false,
    });
  };

  handleCancel = () => {
    this.setState({
      visible: false,
    });
  };

  render() {
    const { visible, title, url } = this.state;
    return (
      <div>
        {this.props.render(this.showModal)}
        <Modal
          title="Update Menu"
          visible={visible}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
          centered
        >
          <Row className="mb-4">
            <Col>
              <h6>Navigation Label</h6>
              <Input name="title" value={title} onChange={this.handleChange} />
            </Col>
          </Row>
          {!isEmpty(url) && (
            <Row>
              <Col>
                <h6>URL</h6>
                <Input name="url" value={url} onChange={this.handleChange} />
              </Col>
            </Row>
          )}
        </Modal>
      </div>
    );
  }
}
