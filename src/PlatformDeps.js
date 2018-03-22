const React = require("react");
const ReactDOM = require("react-dom");

// Having troubles with ReactNativeWeb depending on ART depending on document global..
// I attempted to use the react-native-web babel plugin, but it caused a compile-time crash while art depended on global.document...
// https://github.com/necolas/react-native-web/issues/737
if (typeof document === "undefined") {
  global.document = {
    createElement: () => null,
  };
}

const Platform = {
  web: true,
  webServer: true,
  webBrowser: false,
  mobile: false,
  os: "web",
};
const platformDeps = {
  Platform,
  React,
  ProcessEnv: process.env,
  _npm_react: React,
  _npm_react_dom: ReactDOM,
  _npm_react_native: null,
  _npm_react_native_web: require("react-native-web"),
  _npm_react_navigation: null,
  _npm_luxon: require("luxon"),
  _npm_react_native_markdown_renderer: null,
  _npm_remarkable: require("remarkable"),
  BrowserHistory: null,
  _npm_js_cookie: null,
  _npm_react_fontawesome: require("react-fontawesome"),
  _npm_tinycolor2: require("tinycolor2"),
  _npm_monaco_editor: null,
};

module.exports = platformDeps;
