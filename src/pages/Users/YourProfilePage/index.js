import Page from 'components/LayoutComponents/Page';
import Helmet from 'react-helmet';
import YourProfile from './YourProfile';
import React from 'react';

class YourProfilePage extends React.Component {
  static defaultProps = {
    pathName: 'Your Profile',
    roles: ['agent', 'administrator', 'editor', 'author', 'contributor', 'subscriber'],
  };

  render() {
    const props = this.props;
    return (
      <Page {...props}>
        <Helmet title="Your Profile" />
        <YourProfile />
      </Page>
    );
  }
}

export default YourProfilePage;
