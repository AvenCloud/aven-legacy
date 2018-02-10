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
  _npm_react: React,
  _npm_react_dom: ReactDOM,
  _npm_react_native: null,
  _npm_react_native_web: ReactNativeWeb,
  _npm_react_navigation: null,
};

module.exports = platformDeps;
