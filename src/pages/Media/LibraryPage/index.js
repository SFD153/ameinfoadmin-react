import Page from 'components/LayoutComponents/Page';
import Helmet from 'react-helmet';
import Library from './Library';
import React from 'react';

class LibraryPage extends React.Component {
  static defaultProps = {
    pathName: 'Library',
    roles: ['agent', 'administrator', 'agent', 'editor', 'author', 'contributor', 'subscriber'],
  };

  render() {
    const props = this.props;
    return (
      <Page {...props}>
        <Helmet title="Library" />
        <Library />
      </Page>
    );
  }
}

export default LibraryPage;
