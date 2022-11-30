import Page from 'components/LayoutComponents/Page';
import Helmet from 'react-helmet';
import Categories from './Categories';
import React from 'react';
import Can from 'utils/Can';
import { connect } from 'react-redux';

@connect(state => ({
  role: state.app.userState.role,
}))
class CategoriesPage extends React.Component {
  static defaultProps = {
    pathName: 'Categories',
    roles: ['agent', 'administrator', 'editor'],
  };

  render() {
    const props = this.props;
    return (
      <Page {...props}>
        <Can do="manage" on={{ __type: 'EDITOR', assignee: this.props.role }}>
          <Helmet title="Categories" />
          <Categories {...props} />
        </Can>
      </Page>
    );
  }
}

export default CategoriesPage;
