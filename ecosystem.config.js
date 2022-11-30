module.exports = {
  apps: [
    {
      name: 'ameinfo-admin',
      script: './node_modules/.bin/react-app-rewired',
      watch: true,
      env: {
        interpreter: 'none',
        args: 'start',
        HTTPS: 'true',
        PORT: '8443',
        REACT_APP_DISABLE_MENU_DEVELOPMENT_COMPONENTS: true,
      }
    },
  ],
};
