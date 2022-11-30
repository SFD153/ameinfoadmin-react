import React from 'react';
import { Table, Row, Col, Modal, notification, DatePicker, Spin, Button } from 'antd';
import InfoCard from 'components/DashboardComponents/InfoCard';
import agent from 'utils/agent';
import { get, isEmpty, remove } from 'lodash';
import { CSVLink } from 'react-csv';

const { RangePicker } = DatePicker;

class EditorReport extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      averageWordCount: 0,
      averageNumberOfArticlePerDay: 0,
      totalNumberOfArticle: 0,
      editorReports: [],
      posts: [],
      csvData: [],
      visible: false,
    };

    this.handleClickView = this.handleClickView.bind(this);
    this.handleOk = this.handleOk.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
    this.handleChangeRange = this.handleChangeRange.bind(this);
    this.getReports = this.getReports.bind(this);
    this.getPosts = this.getPosts.bind(this);
  }

  async componentDidMount() {
    await this.getReports();
    await this.getCSVReports();
  }

  async getReports(startDate, endDate) {
    this.setState({ loading: true });
    let averageWordCount = 0;
    let averageNumberOfArticlePerDay = 0;
    let totalNumberOfArticle = 0;
    let editorReports = [];
    let query = {};

    if (!isEmpty(startDate) && !isEmpty(endDate)) {
      query.startDate = startDate;
      query.endDate = endDate;
    }

    try {
      let response = await agent.get('/reports/editor').query(query);
      averageWordCount = response.body.averageWordCount;
      averageNumberOfArticlePerDay = response.body.averageNumberOfArticlePerDay;
      totalNumberOfArticle = response.body.totalNumberOfArticle;
      editorReports = response.body.numberOfArticlesForEachAuthor;
    } catch (e) {
      notification.open({
        type: 'error',
        message: 'Error',
        description: 'Can not get report editor',
      });
    }

    this.setState({
      loading: false,
      averageWordCount: averageWordCount,
      averageNumberOfArticlePerDay: averageNumberOfArticlePerDay,
      totalNumberOfArticle: totalNumberOfArticle,
      editorReports: editorReports,
    });
  }

  async getCSVReports(startDate, endDate) {
    let csvData = [];
    let query = {};

    if (!isEmpty(startDate) && !isEmpty(endDate)) {
      query.startDate = startDate;
      query.endDate = endDate;
    }

    try {
      let response = await agent.get('/reports/editor/csv').query(query);
      csvData = this.getCSVData(response.body.data);
    } catch (e) {
      notification.open({
        type: 'error',
        message: 'Error',
        description: 'Can not get report editor',
      });
    }

    this.setState({ csvData });
  }

  async getPosts(postId) {
    let posts = [];

    try {
      let response = await agent.post('/posts/permalink').send({ id: postId });
      posts = response.body;
    } catch (e) {
      notification.open({
        type: 'error',
        message: 'Error',
        description: 'Can not get post of the author',
      });
    }

    this.setState({ posts: posts });
  }

  getCSVData(reports) {
    return reports.map(report => {
      const item = {
        author: `${report.user.firstName} ${report.user.lastName}`,
        email: report.user.email,
        count: report.count,
        date: `${report._id.day}/${report._id.month}/${report._id.year}`,
      };

      let count = 1;
      for (const link of report.posts) {
        item[`article-${count}`] = `=HYPERLINK(""${process.env.REACT_APP_WEB_URL + link}"")`;
        count++;
      }

      return item;
    });
  }

  async handleClickView(record) {
    const posts = record.posts.map(post => post._id);
    await this.getPosts(posts);
    this.setState({ visible: true });
  }

  handleOk() {
    this.setState({ visible: false });
  }

  handleCancel() {
    this.setState({ visible: false });
  }

  handleChangeRange(date, dateString) {
    const startDate = dateString[0];
    const endDate = dateString[1];
    this.getReports(startDate, endDate);
    this.setState(
      {
        csvData: [],
      },
      async () => {
        await this.getCSVReports(startDate, endDate);
      },
    );
  }

  render() {
    const {
      loading,
      averageWordCount,
      averageNumberOfArticlePerDay,
      totalNumberOfArticle,
      visible,
      posts,
      csvData,
    } = this.state;

    let { editorReports } = this.state;
    editorReports = editorReports.filter(editor => !isEmpty(editor.user));
    editorReports = remove(editorReports, editor => editor.user.username !== 'chienglory');

    const tableColumns = [
      {
        title: 'Author',
        dataIndex: 'fullname',
        key: 'fullname',
        sorter: (a, b) => a.user.username.length - b.user.username.length,
        render: (text, record) => {
          const firstName = get(record, 'user.firstName');
          const lastName = get(record, 'user.lastName');
          let fullName = `${firstName} ${lastName}`;

          if (isEmpty(firstName) && isEmpty(lastName)) {
            fullName = get(record, 'user.username', 'Anonymous');
          }

          return fullName.trim();
        },
      },
      {
        title: 'Email',
        dataIndex: 'email',
        key: 'email',
        sorter: (a, b) => a.user.email.length - b.user.email.length,
        render: (text, record) => {
          return get(record, 'user.email');
        },
      },
      {
        title: 'Count',
        dataIndex: 'count',
        key: 'count',
        sorter: (a, b) => a.count - b.count,
      },
      {
        title: 'Date',
        dataIndex: 'date',
        key: 'date',
        render: (text, record) => {
          const year = record._id.year;
          const month = record._id.month;
          const day = record._id.day;
          return `${day}/${month}/${year}`;
        },
      },
      {
        title: 'Articles',
        dataIndex: 'articles',
        key: 'articles',
        render: (text, record) => {
          return (
            <a
              href="javascript:void(0)"
              onClick={async () => {
                await this.handleClickView(record);
              }}
            >
              View All
            </a>
          );
        },
      },
    ];

    return (
      <Row>
        <div className="utils__title utils__title--flat mb-3">
          <span className="text-uppercase font-size-16">Editor Report</span>
        </div>
        <br />
        <Row>
          <Col xs={24} md={24}>
            <div className="card">
              <div className="card-header">
                <div className="utils__title">
                  <strong>Post Statistics</strong>
                </div>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-lg-4">
                    <InfoCard
                      form="stats"
                      icon="books"
                      type="primary"
                      title="Total article"
                      count={totalNumberOfArticle}
                    />
                  </div>
                  <div className="col-lg-4">
                    <InfoCard
                      form="stats"
                      icon="file-text"
                      type="empty"
                      title="Average article per day"
                      count={averageNumberOfArticlePerDay}
                    />
                  </div>
                  <div className="col-lg-4">
                    <InfoCard
                      form="stats"
                      icon="paragraph-justify"
                      type="primary"
                      title="Average word count"
                      count={averageWordCount}
                    />
                  </div>
                </div>
                <div className="row mb-4">
                  <div className="col-lg-4">
                    <RangePicker onChange={this.handleChangeRange} />
                  </div>
                  <div className="col-lg-8">
                    <CSVLink data={csvData}>
                      <Button htmlType="button" type="primary" loading={isEmpty(csvData)}>
                        Export to CSV
                      </Button>
                    </CSVLink>
                  </div>
                </div>
                <div className="row">
                  <div className="col-lg-12">
                    <Table
                      rowKey="id"
                      columns={tableColumns}
                      dataSource={editorReports}
                      pagination={false}
                      loading={loading}
                    />
                  </div>
                </div>
              </div>
            </div>
          </Col>
        </Row>
        <Modal
          title="All Articles"
          centered
          visible={visible}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
        >
          {!isEmpty(posts) &&
            posts.map(post => (
              <a
                className="d-block"
                href={`${process.env.REACT_APP_WEB_URL}${post.permalink}`}
                target="_blank"
              >
                {post.title}
              </a>
            ))}
        </Modal>
      </Row>
    );
  }
}

export default EditorReport;
