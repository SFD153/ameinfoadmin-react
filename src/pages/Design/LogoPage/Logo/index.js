import React from 'react';
import { Upload, Spin, Button, Icon, message } from 'antd';
import { Row, Col } from 'antd';
import agent from 'utils/agent';
import isEmpty from 'lodash/isEmpty';
import { notification } from 'antd/lib/index';
import { get, set } from 'utils/setting';

class Logo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      spin: true,
      settings: [],
      logo: '',
      params: {
        select: 'name,value',
        where: {
          name: ['logo'],
        },
      },
    };
    this.beforeUpload = this.beforeUpload.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleClickDelete = this.handleClickDelete.bind(this);
  }

  async componentDidMount() {
    let { params } = this.state;
    let settings = [];
    let logo = '';

    try {
      let response = await agent.get('/settings').query(params);
      settings = response.body.results;
      logo = get(settings, 'logo');
    } catch (e) {
      notification.open({
        type: 'error',
        message: 'Error',
        description: 'Can not get logo',
      });
    }

    this.setState({
      settings: settings,
      logo: logo,
      spin: false,
    });
  }

  beforeUpload(file) {
    const isImage = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isImage) {
      message.error('You can only upload JPG/PNG file!');
    }

    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('Image must smaller than 2MB!');
    }

    return isImage && isLt2M;
  }

  async handleChange(info) {
    if (info.file.status === 'uploading') {
      this.setState({ loading: true });
      return;
    }

    if (info.file.status === 'done') {
      const { settings } = this.state;
      let logo = info.file.response.link;

      let setting = set(settings, 'logo', logo);

      try {
        await agent.put('/settings').send([setting]);
      } catch (e) {
        notification.open({
          type: 'error',
          message: 'Error',
          description: 'Can not update logo',
        });
      }

      this.setState({
        logo: logo,
        loading: false,
      });
    }
  }

  async handleClickDelete() {
    this.setState({ spin: true });
    const { settings } = this.state;
    let logo = '';
    let setting = set(settings, 'logo', logo);

    try {
      await agent.put('/settings').send([setting]);
    } catch (e) {
      notification.open({
        type: 'error',
        message: 'Error',
        description: 'Can not delete logo',
      });
    }

    this.setState({
      logo: logo,
      spin: false,
    });
  }

  render() {
    const { spin, logo, loading } = this.state;
    const uploadButton = (
      <div>
        <Icon type={loading ? 'loading' : 'plus'} />
        <div className="ant-upload-text">Upload</div>
      </div>
    );
    return (
      <div>
        <div className="utils__title utils__title--flat mb-3">
          <Row>
            <Col xs={24} md={8}>
              <div className="card">
                <div className="card-header">
                  <div className="utils__title">
                    <strong>Upload Logo</strong>
                  </div>
                </div>
                <div className="card-body">
                  <Spin spinning={spin}>
                    <Upload
                      name="media"
                      className="logo-uploader"
                      listType="picture-card"
                      showUploadList={false}
                      action={process.env.REACT_APP_API_URL + '/medias'}
                      beforeUpload={this.beforeUpload}
                      onChange={this.handleChange}
                    >
                      {isEmpty(logo) ? uploadButton : <img src={logo} width="100%" alt="" />}
                    </Upload>
                    {!isEmpty(logo) ? (
                      <Button
                        className="mt-4"
                        type="primary"
                        size="large"
                        onClick={this.handleClickDelete}
                      >
                        Delete
                      </Button>
                    ) : (
                      ''
                    )}
                  </Spin>
                </div>
              </div>
            </Col>
          </Row>
        </div>
      </div>
    );
  }
}

export default Logo;
