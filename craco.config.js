// Do not use "homepage" value defined in package.json
// as the public path:
process.env.PUBLIC_URL = process.env.PUBLIC_URL || '/';

process.env.REACT_APP_VERSION = require("./package.json").version;

// const CSS_MODULE_LOCAL_IDENT_NAME = 'jsconsole_[local]___[hash:base64:5]';
// ^ The hash:base64:5 function seems to be inconsistent between
// webpack css output and babel-plugin-react-css-modules; omitting it
// for now.
const CSS_MODULE_LOCAL_IDENT_NAME = 'thirdparty_jsconsole_[local]';

module.exports = {
  eslint: {
    mode: 'file',
  },
  style: {
    modules: {
      localIdentName: CSS_MODULE_LOCAL_IDENT_NAME,
    },
    css: {
      // options passed to css-loader
      loaderOptions: {
        url: true,
      }
    }
  },
  babel: {
    plugins: [
      [
        'babel-plugin-react-css-modules',
        {
          generateScopedName: CSS_MODULE_LOCAL_IDENT_NAME,
          attributeNames: { activeStyleName: 'activeClassName' },
          // ObjectType.js embeds styleNames depending on the
          // toString output of an object. Hence, babel-plugin-react-css-modules
          // might complain about a classname such as [object DOMException]
          // being not found.
          handleMissingStyleName: process.env.NODE_ENV === "production"
            ? "ignore" : "warn"
        },
      ],
    ],
  },
  webpack: {
    alias: {
      "react": "preact/compat",
      "react-dom/test-utils": "preact/test-utils",
      "react-dom": "preact/compat",     // Must be below test-utils
      "react/jsx-runtime": "preact/jsx-runtime",
    },
    configure: (webpackConfig, { env, paths }) => {
      if (env === 'production') {
        webpackConfig.optimization = webpackConfig.optimization || {};
        webpackConfig.optimization.splitChunks = webpackConfig.optimization.splitChunks || {};
        webpackConfig.optimization.splitChunks.cacheGroups = webpackConfig.optimization.splitChunks.cacheGroups || {};
        webpackConfig.optimization.splitChunks.cacheGroups.styles = {
          ...webpackConfig.optimization.splitChunks.cacheGroups.styles,
          // Note(alichry, 2025): Extracting all CSS in a single file
          // https://webpack.js.org/plugins/mini-css-extract-plugin/#extracting-all-css-in-a-single-file
          name: "styles",
          type: "css/mini-extract",
          chunks: "all",
          enforce: true,
        };
      }
      return webpackConfig;
    }
  },
};