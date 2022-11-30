import Page from 'components/LayoutComponents/Page'
import Helmet from 'react-helmet'
import Scripts from './Scripts'
import React from 'react'

class ScriptsPage extends React.Component {
  static defaultProps = {
    pathName: 'Scripts',
    roles: ['agent', 'administrator'],
  }

  render() {
    const props = this.props
    return (
      <Page {...props}>
        <Helmet title="Scripts" />
        <Scripts />
      </Page>
    )
  }
}

export default ScriptsPage
