import Page from 'components/LayoutComponents/Page';
import Helmet from 'react-helmet';
import EditTag from './EditTag';
import React from 'react';
import Can from 'utils/Can';
import { connect } from 'react-redux';

@connect(state => ({
  role: state.app.userState.role,
}))
class EditTagPage extends React.Component {
  static defaultProps = {
    pathName: 'Edit Tag',
    roles: ['agent', 'administrator', 'editor'],
  };

  render() {
    const props = this.props;
    return (
      <Page {...props}>
        <Can do="manage" on={{ __type: 'EDITOR', assignee: this.props.role }}>
          <Helmet title="Edit Tag" />
          <EditTag {...props} />
        </Can>
      </Page>
    );
  }
}

export default EditTagPage;
