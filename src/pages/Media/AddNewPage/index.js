import Page from 'components/LayoutComponents/Page';
import Helmet from 'react-helmet';
import AddNew from './AddNew';
import React from 'react';
import Can from 'utils/Can';
import { connect } from 'react-redux';

@connect(state => ({
  role: state.app.userState.role,
}))
class AddNewPage extends React.Component {
  static defaultProps = {
    pathName: 'Add New',
    roles: ['agent', 'administrator', 'editor', 'author'],
  };

  render() {
    const props = this.props;
    return (
      <Page {...props}>
        <Can do="manage" on={{ __type: 'AUTHOR', assignee: this.props.role }}>
          <Helmet title="Add New" />
          <AddNew />
        </Can>
      </Page>
    );
  }
}

export default AddNewPage;
