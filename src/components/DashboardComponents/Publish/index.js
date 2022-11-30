import React from 'react';
import PropTypes from 'prop-types';
import { Button, Col, Row } from 'antd';
import isEmpty from 'lodash/isEmpty';
import cn from 'classnames';

class Publish extends React.Component {
  render() {
    const { submitText, saveText, onSave, onPreview, onSubmit, children } = this.props;

    const confirmSubmit = () => {
      if (submitText !== 'Publish' || window.confirm('Publish this post?')) {
        onSubmit();
      }
    };

    const hide = isEmpty(saveText);

    return (
      <section>
        <Row>
          <Col xs={16} md={16}>
            <div className="text-left">
              <Button className={cn({ hide })} onClick={onSave}>
                {saveText}
              </Button>
            </div>
          </Col>
          <Col xs={8} md={8}>
            <div className="text-right">
              <Button onClick={onPreview}>Preview</Button>
            </div>
          </Col>
        </Row>
        <br />
        {children}
        <Row>
          <Col xs={24} md={24}>
            <div className="text-right">
              <Button type="primary" onClick={confirmSubmit}>
                {submitText}
              </Button>
            </div>
          </Col>
        </Row>
      </section>
    );
  }
}

Publish.propTypes = {
  saveText: PropTypes.string,
  submitText: PropTypes.string,
  onSave: PropTypes.func,
  onPreview: PropTypes.func,
  onSubmit: PropTypes.func,
};

Publish.defaultProps = {
  saveText: 'Save Draft',
  submitText: 'Publish',
};

export default Publish;
