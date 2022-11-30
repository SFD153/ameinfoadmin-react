import Page from 'components/LayoutComponents/Page';
import Helmet from 'react-helmet';
import EditCategory from './EditCategory';
import React from 'react';
import Can from 'utils/Can';
import { connect } from 'react-redux';

@connect(state => ({
  role: state.app.userState.role,
}))
class EditCategoryPage extends React.Component {
  static defaultProps = {
    pathName: 'Edit Category',
    roles: ['agent', 'administrator', 'editor'],
  };

  render() {
    const props = this.props;
    return (
      <Page {...props}>
        <Can do="manage" on={{ __type: 'EDITOR', assignee: this.props.role }}>
          <Helmet title="Edit Category" />
          <EditCategory {...props} />
        </Can>
      </Page>
    );
  }
}

export default EditCategoryPage;
