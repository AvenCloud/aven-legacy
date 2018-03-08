const React = require("react");
const ReactDOM = require("react-dom");
const ReactNativeWeb = require("react-native-web");

const Platform = {
  web: true,
  webServer: false,
  webBrowser: true,
  mobile: false,
  os: "web",
};

const platformDeps = {
  Platform,
  React,
  ProcessEnv: {},
  _npm_react: React,
  _npm_react_dom: ReactDOM,
  _npm_react_native: null,
  _npm_react_native_web: ReactNativeWeb,
  _npm_react_navigation: null,
  _npm_luxon: require("luxon"),
  _npm_react_native_markdown_renderer: null,
  _npm_remarkable: require("remarkable"),
  BrowserHistory: require("./BrowserHistory"),
  _npm_js_cookie: require("js-cookie"),
  _npm_tinycolor2: require("tinycolor2"),
};

module.exports = platformDeps;
