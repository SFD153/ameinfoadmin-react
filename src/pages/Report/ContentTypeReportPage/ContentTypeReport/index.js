import React from 'react';
import { Table, notification, Row, Col } from 'antd';
import agent from 'utils/agent';
import { get } from 'lodash';

class ContentTypeReport extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      contentTypeReports: [],
      loading: true,
    };
  }

  async componentDidMount() {
    let contentTypeReports = [];

    try {
      let response = await agent.get('/reports/content-type');
      contentTypeReports = response.body;
    } catch (e) {
      notification.open({
        type: 'error',
        message: 'Error',
        description: 'Can not get content type report',
      });
    }

    this.setState({
      contentTypeReports: contentTypeReports,
      loading: false,
    });
  }

  render() {
    const { contentTypeReports, loading } = this.state;
    const tableColumns = [
      {
        title: 'Type',
        dataIndex: 'display',
        key: 'display',
        render: (text, record) => {
          return get(record, 'format.display', null);
        },
      },
      {
        title: 'Count',
        dataIndex: 'count',
        key: 'count',
      },
    ];

    return (
      <Row>
        <div className="utils__title utils__title--flat mb-3">
          <span className="text-uppercase font-size-16">Content Type Report</span>
        </div>
        <br />
        <Row>
          <Col xs={24} md={24}>
            <div className="card">
              <div className="card-body">
                <Table
                  rowKey="id"
                  columns={tableColumns}
                  dataSource={contentTypeReports}
                  loading={loading}
                  pagination={false}
                />
              </div>
            </div>
          </Col>
        </Row>
      </Row>
    );
  }
}

export default ContentTypeReport;
