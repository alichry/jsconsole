const cracoConfig = require("./craco.config");

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
          "generateScopedName": cracoConfig.style.modules.localIdentName,
          "attributeNames": {
            "activeStyleName": "activeClassName"
          },
          // ObjectType.js embeds styleNames depending on the
          // toString output of an object. Hence, babel-plugin-react-css-modules
          // might complain about a classname such as [object DOMException]
          // being not found.
          "handleMissingStyleName": "warn"
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