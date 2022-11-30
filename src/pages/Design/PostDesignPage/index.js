import Page from 'components/LayoutComponents/Page'
import Helmet from 'react-helmet'
import PostDesign from './PostDesign'
import React from 'react'

class PostDesignPage extends React.Component {
  static defaultProps = {
    pathName: 'PostDesign',
    roles: ['agent', 'administrator'],
  }

  render() {
    const props = this.props
    return (
      <Page {...props}>
        <Helmet title="PostDesign" />
        <PostDesign />
      </Page>
    )
  }
}

export default PostDesignPage
