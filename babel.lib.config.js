const cracoConfig = require("./craco.config");

module.exports = function (api) {
  api.cache.forever();

  return {
    "sourceMaps": true,
    "presets": [
      "@babel/preset-react"
    ],
    "plugins": [
      ...cracoConfig.babel.plugins,
      [
        "babel-plugin-transform-replace-expressions",
        {
          "replace": {
            "process.env.REACT_APP_VERSION": `"${require("./package.json").version}"`,
            "process.env.REACT_APP_API": `${JSON.stringify(process.env.REACT_APP_API || "")}`
          }
        }
      ],
      [
        "babel-plugin-search-and-replace",
        {
          "rules": [
            {
              "search": /jsconsole.module.css/,
              "replace": "jsconsole.css"
            }
          ]
        }
      ]
    ]
  };
}