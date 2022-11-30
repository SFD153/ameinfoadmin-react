import Page from 'components/LayoutComponents/Page';
import Helmet from 'react-helmet';
import EditorReport from './EditorReport';
import React from 'react';

class EditorReportPage extends React.Component {
  static defaultProps = {
    pathName: 'Editor Report',
    roles: ['agent', 'administrator'],
  };

  render() {
    const props = this.props;
    return (
      <Page {...props}>
        <Helmet title="Editor Report" />
        <EditorReport />
      </Page>
    );
  }
}

export default EditorReportPage;
