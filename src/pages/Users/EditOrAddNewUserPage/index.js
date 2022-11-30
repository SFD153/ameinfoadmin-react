import Page from 'components/LayoutComponents/Page';
import Helmet from 'react-helmet';
import EditOrAddNewUser from './EditOrAddNewUser';
import React from 'react';
import { connect } from 'react-redux';
import Can from 'utils/Can';

@connect(state => ({
  role: state.app.userState.role,
}))
class EditOrAddNewUserPage extends React.Component {
  static defaultProps = {
    pathName: 'Edit User',
    roles: ['agent', 'administrator'],
  };

  render() {
    const props = this.props;
    return (
      <Page {...props}>
        <Can do="manage" on={{ __type: 'ADMIN', assignee: this.props.role }}>
          <Helmet title="Edit User" />
          <EditOrAddNewUser {...props} />
        </Can>
      </Page>
    );
  }
}

export default EditOrAddNewUserPage;
