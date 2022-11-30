import Page from 'components/LayoutComponents/Page';
import Helmet from 'react-helmet';
import SiteIdentity from './SiteIdentity';
import React from 'react';

class SiteIdentityPage extends React.Component {
  static defaultProps = {
    pathName: 'SiteIdentity',
    roles: ['agent', 'administrator'],
  };

  render() {
    const props = this.props;
    return (
      <Page {...props}>
        <Helmet title="SiteIdentity" />
        <SiteIdentity {...props} />
      </Page>
    );
  }
}

export default SiteIdentityPage;
