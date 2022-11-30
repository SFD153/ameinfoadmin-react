import Page from 'components/LayoutComponents/Page';
import Helmet from 'react-helmet';
import EditOrAddNewAd from './EditOrAddNewAd';
import React from 'react';

class EditOrAddNewAdPage extends React.Component {
  static defaultProps = {
    pathName: 'Edit Ad',
    roles: ['agent', 'administrator'],
  };

  render() {
    const props = this.props;
    return (
      <Page {...props}>
        <Helmet title="Edit Ad" />
        <EditOrAddNewAd {...props} />
      </Page>
    );
  }
}

export default EditOrAddNewAdPage;
