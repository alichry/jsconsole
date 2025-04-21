const { CSS_MODULE_LOCAL_IDENT_NAME } = require("./craco.config");

module.exports = function (api) {
  api.cache.forever();

  return {
    "sourceMaps": true,
    "presets": [
      "@babel/preset-react"
    ],
    "plugins": [
      [
        "babel-plugin-react-css-modules",
        {
          "generateScopedName": CSS_MODULE_LOCAL_IDENT_NAME,
          "attributeNames": {
            "activeStyleName": "activeClassName"
          }
        }
      ],
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