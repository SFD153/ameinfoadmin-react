import Page from 'components/LayoutComponents/Page';
import Helmet from 'react-helmet';
import EditOrAddNewPost from './EditOrAddNewPost';
import React from 'react';

class EditOrAddNewPostPage extends React.Component {
  static defaultProps = {
    pathName: 'Edit Post',
    roles: ['agent', 'administrator', 'editor'],
  };

  render() {
    const props = this.props;
    return (
      <Page {...props}>
        <Helmet title="Edit Post" />
        <EditOrAddNewPost {...props} />
      </Page>
    );
  }
}

export default EditOrAddNewPostPage;
