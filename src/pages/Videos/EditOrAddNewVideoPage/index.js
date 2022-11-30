import Page from 'components/LayoutComponents/Page';
import Helmet from 'react-helmet';
import EditOrAddNewVideo from './EditOrAddNewVideo';
import React from 'react';

class EditOrAddNewVideoPage extends React.Component {
  static defaultProps = {
    pathName: 'Edit Video',
    roles: ['agent', 'administrator', 'editor'],
  };

  render() {
    const props = this.props;
    return (
      <Page {...props}>
        <Helmet title="Edit Video" />
        <EditOrAddNewVideo {...props} />
      </Page>
    );
  }
}

export default EditOrAddNewVideoPage;
