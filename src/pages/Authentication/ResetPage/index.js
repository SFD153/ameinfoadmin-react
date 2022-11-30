import React from 'react';
import Page from 'components/LayoutComponents/Page';
import Helmet from 'react-helmet';
import Reset from './Reset';

class ResetPage extends React.Component {
  render() {
    const { match, ...props } = this.props;
    return (
      <Page {...props}>
        <Helmet title="Reset" />
        <Reset match={match} />
      </Page>
    );
  }
}

export default ResetPage;
