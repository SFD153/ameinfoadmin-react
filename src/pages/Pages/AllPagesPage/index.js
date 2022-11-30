import Page from 'components/LayoutComponents/Page';
import Helmet from 'react-helmet';
import AllPages from './AllPages';
import React from 'react';
import Can from 'utils/Can';
import { connect } from 'react-redux';

@connect(state => ({
  role: state.app.userState.role,
}))
class AllPagesPage extends React.Component {
  static defaultProps = {
    pathName: 'All Pages',
    roles: ['agent', 'administrator', 'editor'],
  };

  render() {
    const props = this.props;
    return (
      <Page {...props}>
        <Can do="manage" on={{ __type: 'EDITOR', assignee: this.props.role }}>
          <Helmet title="All Pages" />
          <AllPages />
        </Can>
      </Page>
    );
  }
}

export default AllPagesPage;
