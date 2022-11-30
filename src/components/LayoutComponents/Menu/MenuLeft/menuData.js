import jwtDecode from 'jwt-decode';
import isEmpty from 'lodash/isEmpty';

const token = localStorage.getItem('app.Authorization');
const decode = !isEmpty(token) ? jwtDecode(token) : null;
const role = !isEmpty(decode) ? decode.role : localStorage.getItem('app.Role');

let menuData = [
  {
    title: 'Posts',
    key: 'posts',
    icon: 'fa fa-wpforms',
    children: [
      {
        title: 'All Posts',
        key: 'allPosts',
        url: '/posts/all-posts',
      },
    ],
  },
  {
    title: 'Videos',
    key: 'videos',
    icon: 'fa fa-video-camera',
    children: [
      {
        title: 'All Videos',
        key: 'allVideos',
        url: '/videos/all-videos',
      },
    ],
  },
  {
    title: 'Media',
    key: 'media',
    icon: 'fa fa-camera',
    children: [
      {
        title: 'Library',
        key: 'library',
        url: '/media/library',
      },
    ],
  },
  {
    title: 'Users',
    key: 'users',
    icon: 'fa fa-user',
    children: [
      {
        title: 'Your Profile',
        key: 'yourProfile',
        url: '/users/your-profile',
      },
    ],
  },
];

const indexPost = menuData.findIndex(e => e.key === 'posts');
const indexVideo = menuData.findIndex(e => e.key === 'videos');
const indexMedia = menuData.findIndex(e => e.key === 'media');

//  0:"subscriber"
//  1:"contributor"
//  2:"author"
//  3:"editor"
//  4:"administrator"
const listRoles = ['subscriber', 'contributor', 'author', 'editor', 'administrator'];
const indexRole = listRoles.indexOf(role);

// >= author
if (indexRole >= 2) {
  menuData[indexPost].children.push({
    title: 'Add New',
    key: 'addNewPost',
    url: '/posts/add-new',
  });

  menuData[indexVideo].children.push({
    title: 'Add New',
    key: 'addNewVideo',
    url: '/videos/add-new',
  });

  menuData[indexMedia].children.push({
    title: 'Add New',
    key: 'addNewMedia',
    url: '/media/add-new',
  });
}

// >= editor
if (indexRole >= 3) {
  // post
  menuData[indexPost].children = menuData[indexPost].children.concat([
    {
      title: 'Categories',
      key: 'categories',
      url: '/posts/categories',
    },
    {
      title: 'Tags',
      key: 'tags',
      url: '/posts/tags',
    },
  ]);

  // video
  menuData[indexVideo].children = menuData[indexVideo].children.concat([
    {
      title: 'Categories',
      key: 'videoCategories',
      url: '/videos/categories',
    },
  ]);

  // pages
  menuData.splice(1, 0, {
    title: 'Pages',
    key: 'pages',
    icon: 'fa fa-file-word-o',
    children: [
      {
        title: 'All Pages',
        key: 'allPages',
        url: '/pages/all-pages',
      },
      {
        title: 'Add New',
        key: 'addNewPage',
        url: '/pages/add-new',
      },
    ],
  });

  menuData.splice(1, 0, {
    title: 'Features',
    key: 'features',
    icon: 'fa fa-lightbulb-o',
    children: [
      {
        title: 'General',
        key: 'general',
        url: '/features/general',
      },
      {
        title: 'Sidebar',
        key: 'sidebar',
        url: '/features/sidebar',
      },
    ],
  });
}

const indexUser = menuData.findIndex(e => e.key === 'users');
// editors only
if (indexRole === 3) {
  menuData[indexUser].children = menuData[indexUser].children.concat([
    {
      title: 'Contributors & Authors',
      key: 'allContributors',
      url: '/users/all-contributors',
    },
    {
      title: 'Add New',
      key: 'addNewContributor',
      url: '/users/add-contributor',
    },
  ]);
} else if (indexRole === 4) {
  menuData[indexUser].children = menuData[indexUser].children.concat([
    {
      title: 'All Users',
      key: 'allUsers',
      url: '/users/all-users',
    },
    {
      title: 'Add New',
      key: 'addNewUser',
      url: '/users/add-new',
    },
  ]);
  menuData.splice(
    indexUser,
    0,
    {
      title: 'Ads',
      key: 'ads',
      icon: 'icmn-text-color',
      children: [
        {
          title: 'All Ads',
          key: 'allAds',
          url: '/ads/all-ads',
        },
        {
          title: 'Add New',
          key: 'addNewAd',
          url: '/ads/add-new',
        },
      ],
    },
    {
      title: 'Report',
      key: 'report',
      icon: 'fa fa-list-ol',
      children: [
        {
          title: 'Editor Report',
          key: 'editorReport',
          url: '/report/editor-report',
        },
        {
          title: 'Tag Report',
          key: 'tagReport',
          url: '/report/tag-report',
        },
        {
          title: 'Content Type Report',
          key: 'contentTypeReport',
          url: '/report/content-type-report',
        },
      ],
    },
    {
      title: 'Design',
      key: 'design',
      icon: 'icmn-pencil2',
      children: [
        {
          title: 'Scripts',
          key: 'scripts',
          url: '/design/scripts',
        },
        {
          title: 'Post Design',
          key: 'postDesign',
          url: '/design/post-design',
        },
        {
          title: 'Logo',
          key: 'logo',
          url: '/design/logo',
        },
        {
          title: 'Site Identity',
          key: 'siteIdentity',
          url: '/design/site-identity',
        },
        {
          title: 'Menu',
          key: 'menu',
          url: '/design/menu',
        },
      ],
    },
  );
}

export default [...menuData];
