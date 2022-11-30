import Page from 'components/LayoutComponents/Page';
import Helmet from 'react-helmet';
import TagReport from './TagReport';
import React from 'react';

class TagReportPage extends React.Component {
  static defaultProps = {
    pathName: 'Tag Report',
    roles: ['agent', 'administrator'],
  };

  render() {
    const props = this.props;
    return (
      <Page {...props}>
        <Helmet title="Tag Report" />
        <TagReport />
      </Page>
    );
  }
}

export default TagReportPage;
