import Page from 'components/LayoutComponents/Page'
import Helmet from 'react-helmet'
import Logo from './Logo'
import React from 'react'

class LogoPage extends React.Component {
  static defaultProps = {
    pathName: 'Logo',
    roles: ['agent', 'administrator'],
  }

  render() {
    const props = this.props
    return (
      <Page {...props}>
        <Helmet title="Logo" />
        <Logo />
      </Page>
    )
  }
}

export default LogoPage
