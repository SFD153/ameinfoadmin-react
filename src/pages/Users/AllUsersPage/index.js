import Page from 'components/LayoutComponents/Page';
import Helmet from 'react-helmet';
import AllUsers from './AllUsers';
import React from 'react';
import { connect } from 'react-redux';
import Can from 'utils/Can';

@connect(state => ({
  role: state.app.userState.role,
}))
class AllUsersPage extends React.Component {
  static defaultProps = {
    pathName: 'AllUsers',
    roles: ['agent', 'administrator'],
  };

  render() {
    const props = this.props;
    return (
      <Page {...props}>
        <Can do="manage" on={{ __type: 'ADMIN', assignee: this.props.role }}>
          <Helmet title="All Users" />
          <AllUsers {...props} />
        </Can>
      </Page>
    );
  }
}

export default AllUsersPage;
