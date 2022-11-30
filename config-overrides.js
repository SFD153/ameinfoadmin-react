const rewired = require('react-app-rewired');
const rewireLess = require('react-app-rewire-less');
const rewireEslint = require('react-app-rewire-eslint');
const rewireProvidePlugin = require('react-app-rewire-provide-plugin');
const path = require('path');
const fs = require('fs');

module.exports = {
  webpack: function (config, env) {
    const cssLoader = rewired.getLoader(
      config.module.rules,
      rule => rule.test && String(rule.test) === String(/\.css$/)
    );

    const sassLoader = {
      test: /\.scss$/,
      use: [...(cssLoader.loader || cssLoader.use), 'sass-loader']
    };

    const oneOf = config.module.rules.find(rule => rule.oneOf).oneOf;

    const plugins = {
      $: "jquery",
      jQuery: "jquery"
    };

    oneOf.unshift(sassLoader);

    config = rewired.injectBabelPlugin('transform-decorators-legacy', config);
    config = rewireLess(config, env);
    config = rewireEslint(config, env);
    config = rewireProvidePlugin(config, env, plugins);
    config.resolve.modules.push(path.resolve('./src'));

    return config;
  },
  devServer: function(configFunction) {
    return function(proxy, allowedHost) {
      // Create the default config by calling configFunction with the proxy/allowedHost parameters
      const config = configFunction(proxy, allowedHost);

      if(!process.env.HTTPS) {
        return config;
      }

      config.https = {
        key: fs.readFileSync(path.join(__dirname, 'ssl/server.key'), 'utf8'),
        cert: fs.readFileSync(path.join(__dirname, 'ssl/server.crt'), 'utf8')
      };

      return config;
    }
  },
};
