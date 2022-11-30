import React from 'react';
import Page from 'components/LayoutComponents/Page';
import Helmet from 'react-helmet';
import Forgot from './Forgot';

class ForgotPage extends React.Component {
  render() {
    const { match, ...props } = this.props;
    return (
      <Page {...props}>
        <Helmet title="Forgot" />
        <Forgot match={match} />
      </Page>
    );
  }
}

export default ForgotPage;
