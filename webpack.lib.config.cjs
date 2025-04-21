const { createWebpackProdConfig } = require('@craco/craco');
const cracoConfig = require("./craco.config");
const { resolve } = require('node:path');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const webpackConfig = createWebpackProdConfig(cracoConfig);

/**
 * We are not interested in the bundle that webpack creates.
 * We only leverage the existing webpack configuration to process
 * CSS and other assets. The downside is that webpack produces
 * a JS bundle that would be discarded by the following babel CLI
 * call (see the lib script in package.json). This build process
 * can be improved to avoid confusion and decrease complexity.
 * TODO: Improve lib build process, starting by refactoring the
 * CSS approach in this codebase from having one project-scoped
 * .module.css file to one .module.css for each component.
 *
 * For now, this lib build approach is sufficient for distribution
 * of react components.
 */

module.exports = [
  {
    ...webpackConfig,
    entry: {
      index: './src/core/index.js'
    },
    mode: 'production',
    output: {
      path: resolve("./dist"),
      filename: '[name].js',
      assetModuleFilename: 'assets/[name][ext]',
      clean: true,
    },
    plugins: [
      new MiniCssExtractPlugin({
        filename: 'jsconsole.css'
      }),
      ...webpackConfig.plugins.filter(p => -1 === [
        "HtmlWebpackPlugin",
        "InlineChunkHtmlPlugin",
        "InterpolateHtmlPlugin",
        "WebpackManifestPlugin",
        "MiniCssExtractPlugin"
      ].indexOf(p.constructor.name)),
    ]
  }
]