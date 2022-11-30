import Page from 'components/LayoutComponents/Page';
import Helmet from 'react-helmet';
import AllContributors from './AllContributors';
import React from 'react';
import { connect } from 'react-redux';
import Can from 'utils/Can';

@connect(state => ({
  role: state.app.userState.role,
}))
class AllContributorsPage extends React.Component {
  static defaultProps = {
    pathName: 'All Contributors',
    roles: ['agent', 'editor'],
  };

  render() {
    const props = this.props;
    return (
      <Page {...props}>
        <Can do="manage" on={{ __type: 'EDITOR', assignee: this.props.role }}>
          <Helmet title="All Contributors" />
          <AllContributors {...props} />
        </Can>
      </Page>
    );
  }
}

export default AllContributorsPage;
