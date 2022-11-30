import Page from 'components/LayoutComponents/Page';
import Helmet from 'react-helmet';
import AllPosts from './AllPosts';
import React from 'react';

class AllPostsPage extends React.Component {
  static defaultProps = {
    pathName: 'All Posts',
    roles: ['agent', 'administrator', 'editor', 'author', 'contributor', 'subscriber'],
  };

  render() {
    const props = this.props;
    return (
      <Page {...props}>
        <Helmet title="All Posts" />
        <AllPosts />
      </Page>
    );
  }
}

export default AllPostsPage;
