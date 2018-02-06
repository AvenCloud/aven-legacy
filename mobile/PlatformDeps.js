const React = require("react");
const ReactNative = require("react-native");

const Platform = {
  web: false,
  webServer: false,
  webBrowser: false,
  mobile: true,
  ...ReactNative.Platform,
};
const platformDeps = {
  Platform,
  React,
  _npm_react: React,
  _npm_react_dom: null,
  _npm_react_native: ReactNative,
};

module.exports = platformDeps;
