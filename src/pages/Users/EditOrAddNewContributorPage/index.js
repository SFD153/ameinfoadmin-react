import Page from 'components/LayoutComponents/Page';
import Helmet from 'react-helmet';
import EditOrAddNewContributor from './EditOrAddNewContributor';
import React from 'react';
import { connect } from 'react-redux';
import Can from 'utils/Can';

@connect(state => ({
  role: state.app.userState.role,
}))
class EditOrAddNewContributorPage extends React.Component {
  static defaultProps = {
    pathName: 'Edit Contributor',
    roles: ['agent', 'editor'],
  };

  render() {
    const props = this.props;
    return (
      <Page {...props}>
        <Can do="manage" on={{ __type: 'EDITOR', assignee: this.props.role }}>
          <Helmet title="Edit Contributor" />
          <EditOrAddNewContributor {...props} />
        </Can>
      </Page>
    );
  }
}

export default EditOrAddNewContributorPage;
