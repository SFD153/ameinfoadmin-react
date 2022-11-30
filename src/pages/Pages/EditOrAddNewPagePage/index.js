import Page from 'components/LayoutComponents/Page';
import Helmet from 'react-helmet';
import EditOrAddNewPage from './EditOrAddNewPage';
import React from 'react';
import Can from 'utils/Can';
import { connect } from 'react-redux';

@connect(state => ({
  role: state.app.userState.role,
}))
class EditOrAddNewPagePage extends React.Component {
  static defaultProps = {
    pathName: 'Add New',
    roles: ['agent', 'administrator', 'editor'],
  };

  render() {
    const props = this.props;
    return (
      <Page {...props}>
        <Can do="manage" on={{ __type: 'EDITOR', assignee: this.props.role }}>
          <Helmet title="Add New" />
          <EditOrAddNewPage {...props} />
        </Can>
      </Page>
    );
  }
}

export default EditOrAddNewPagePage;
