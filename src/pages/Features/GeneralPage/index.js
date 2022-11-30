import Page from 'components/LayoutComponents/Page';
import Helmet from 'react-helmet';
import General from './General';
import React from 'react';

class GeneralPage extends React.Component {
  static defaultProps = {
    pathName: 'General',
    roles: ['agent', 'administrator', 'editor'],
  };

  render() {
    const props = this.props;
    return (
      <Page {...props}>
        <Helmet title="General" />
        <General {...props} />
      </Page>
    );
  }
}

export default GeneralPage;
