import React from 'react';
import { Route } from 'react-router-dom';
import { ConnectedSwitch } from 'reactRouterConnected';
import Loadable from 'react-loadable';
import Page from 'components/LayoutComponents/Page';
import NotFoundPage from 'pages/DefaultPages/NotFoundPage';
import HomePage from 'pages/DefaultPages/HomePage';

const loadable = loader =>
  Loadable({
    loader,
    delay: false,
    loading: () => null,
  });

const loadableRoutes = {
  //Authentication
  '/login': {
    component: loadable(() => import('pages/Authentication/LoginPage')),
  },
  '/register': {
    component: loadable(() => import('pages/Authentication/RegisterPage')),
  },
  '/forgot': {
    component: loadable(() => import('pages/Authentication/ForgotPage')),
  },
  '/reset/:code': {
    component: loadable(() => import('pages/Authentication/ResetPage')),
  },

  // Posts
  '/posts/all-posts': {
    component: loadable(() => import('pages/Posts/AllPostsPage')),
  },
  '/posts/add-new': {
    component: loadable(() => import('pages/Posts/EditOrAddNewPostPage')),
  },
  '/posts/edit-post/:id': {
    component: loadable(() => import('pages/Posts/EditOrAddNewPostPage')),
  },
  '/posts/categories': {
    component: loadable(() => import('pages/Posts/CategoriesPage')),
  },
  '/posts/categories/edit-category/:id': {
    component: loadable(() => import('pages/Posts/EditCategoryPage')),
  },
  '/posts/tags': {
    component: loadable(() => import('pages/Posts/TagsPage')),
  },
  '/posts/tags/edit-tag/:id': {
    component: loadable(() => import('pages/Posts/EditTagPage')),
  },

  // Videos
  '/videos/all-videos': {
    component: loadable(() => import('pages/Videos/AllVideosPage')),
  },
  '/videos/add-new': {
    component: loadable(() => import('pages/Videos/EditOrAddNewVideoPage')),
  },
  '/videos/edit-video/:id': {
    component: loadable(() => import('pages/Videos/EditOrAddNewVideoPage')),
  },
  '/videos/categories': {
    component: loadable(() => import('pages/Videos/CategoriesPage')),
  },
  '/videos/categories/edit-category/:id': {
    component: loadable(() => import('pages/Videos/EditCategoryPage')),
  },

  // Media
  '/media/library': {
    component: loadable(() => import('pages/Media/LibraryPage')),
  },
  '/media/add-new': {
    component: loadable(() => import('pages/Media/AddNewPage')),
  },

  // Pages
  '/pages/all-pages': {
    component: loadable(() => import('pages/Pages/AllPagesPage')),
  },
  '/pages/add-new': {
    component: loadable(() => import('pages/Pages/EditOrAddNewPagePage')),
  },
  '/pages/edit-page/:id': {
    component: loadable(() => import('pages/Pages/EditOrAddNewPagePage')),
  },

  // Users
  '/users/all-users': {
    component: loadable(() => import('pages/Users/AllUsersPage')),
  },
  '/users/add-new': {
    component: loadable(() => import('pages/Users/EditOrAddNewUserPage')),
  },
  '/users/edit-user/:id': {
    component: loadable(() => import('pages/Users/EditOrAddNewUserPage')),
  },
  '/users/your-profile': {
    component: loadable(() => import('pages/Users/YourProfilePage')),
  },
  // contributors
  '/users/all-contributors': {
    component: loadable(() => import('pages/Users/AllContributorsPage')),
  },
  '/users/add-contributor': {
    component: loadable(() => import('pages/Users/EditOrAddNewContributorPage')),
  },
  '/users/edit-contributor/:id': {
    component: loadable(() => import('pages/Users/EditOrAddNewContributorPage')),
  },

  // Ads
  '/ads/all-ads': {
    component: loadable(() => import('pages/Ads/AllAdsPage')),
  },
  '/ads/add-new': {
    component: loadable(() => import('pages/Ads/EditOrAddNewAdPage')),
  },
  '/ads/edit-ad/:id': {
    component: loadable(() => import('pages/Ads/EditOrAddNewAdPage')),
  },

  // Report
  '/report/editor-report': {
    component: loadable(() => import('pages/Report/EditorReportPage')),
  },
  '/report/tag-report': {
    component: loadable(() => import('pages/Report/TagReportPage')),
  },
  '/report/content-type-report': {
    component: loadable(() => import('pages/Report/ContentTypeReportPage')),
  },

  // Design
  '/design/scripts': {
    component: loadable(() => import('pages/Design/ScriptsPage')),
  },
  '/design/post-design': {
    component: loadable(() => import('pages/Design/PostDesignPage')),
  },
  '/design/logo': {
    component: loadable(() => import('pages/Design/LogoPage')),
  },
  '/design/site-identity': {
    component: loadable(() => import('pages/Design/SiteIdentityPage')),
  },
  '/design/menu': {
    component: loadable(() => import('pages/Design/MenuPage')),
  },

  //Features
  '/features/general': {
    component: loadable(() => import('pages/Features/GeneralPage')),
  },
  '/features/sidebar': {
    component: loadable(() => import('pages/Features/SidebarPage')),
  },
};

class Routes extends React.Component {
  timeoutId = null;

  componentDidMount() {
    this.timeoutId = setTimeout(
      () => Object.keys(loadableRoutes).forEach(path => loadableRoutes[path].component.preload()),
      5000, // load after 5 sec
    );
  }

  componentWillUnmount() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
  }

  render() {
    return (
      <ConnectedSwitch>
        <Route exact path="/" component={HomePage} />
        {Object.keys(loadableRoutes).map(path => {
          const { exact, ...props } = loadableRoutes[path];
          props.exact = exact === void 0 || exact || false; // set true as default
          return <Route key={path} path={path} {...props} />;
        })}
        <Route
          render={() => (
            <Page>
              <NotFoundPage />
            </Page>
          )}
        />
      </ConnectedSwitch>
    );
  }
}

export { loadableRoutes };
export default Routes;
