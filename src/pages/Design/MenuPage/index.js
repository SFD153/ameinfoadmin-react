import Page from 'components/LayoutComponents/Page';
import Helmet from 'react-helmet';
import Menu from './Menu';
import React from 'react';

class MenuPage extends React.Component {
  static defaultProps = {
    pathName: 'Menu',
    roles: ['agent', 'administrator'],
  };

  render() {
    const props = this.props;
    return (
      <Page {...props}>
        <Helmet title="Menu" />
        <Menu />
      </Page>
    );
  }
}

export default MenuPage;
