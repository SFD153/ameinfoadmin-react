import Page from 'components/LayoutComponents/Page';
import Helmet from 'react-helmet';
import Sidebar from './Sidebar';
import React from 'react';

class SidebarPage extends React.Component {
  static defaultProps = {
    pathName: 'Sidebar',
    roles: ['agent', 'administrator', 'editor'],
  };

  render() {
    const props = this.props;
    return (
      <Page {...props}>
        <Helmet title="Sidebar" />
        <Sidebar {...props} />
      </Page>
    );
  }
}

export default SidebarPage;
