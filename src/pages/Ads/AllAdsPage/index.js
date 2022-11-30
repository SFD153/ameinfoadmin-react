import Page from 'components/LayoutComponents/Page';
import Helmet from 'react-helmet';
import AllAds from './AllAds';
import React from 'react';

class AllAdsPage extends React.Component {
  static defaultProps = {
    pathName: 'All Ads',
    roles: ['agent', 'administrator'],
  };

  render() {
    const props = this.props;
    return (
      <Page {...props}>
        <Helmet title="All Ads" />
        <AllAds />
      </Page>
    );
  }
}

export default AllAdsPage;
