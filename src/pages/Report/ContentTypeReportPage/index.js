import Page from 'components/LayoutComponents/Page';
import Helmet from 'react-helmet';
import ContentTypeReport from './ContentTypeReport';
import React from 'react';

class ContentTypeReportPage extends React.Component {
  static defaultProps = {
    pathName: 'Editor Report',
    roles: ['agent', 'administrator'],
  };

  render() {
    const props = this.props;
    return (
      <Page {...props}>
        <Helmet title="Editor Report" />
        <ContentTypeReport />
      </Page>
    );
  }
}

export default ContentTypeReportPage;
