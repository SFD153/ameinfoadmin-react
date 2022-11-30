import Page from 'components/LayoutComponents/Page';
import Helmet from 'react-helmet';
import AllVideos from './AllVideos';
import React from 'react';

class AllVideosPage extends React.Component {
  static defaultProps = {
    pathName: 'All Videos',
    roles: ['agent', 'administrator', 'editor', 'author', 'contributor', 'subscriber'],
  };

  render() {
    const props = this.props;
    return (
      <Page {...props}>
        <Helmet title="All Videos" />
        <AllVideos />
      </Page>
    );
  }
}

export default AllVideosPage;
