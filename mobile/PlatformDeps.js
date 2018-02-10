const React = require("react");
const ReactNative = require("react-native");
const ReactNavigation = require("react-navigation");

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
  _npm_react_native_web: null,
  _npm_react_navigation: ReactNavigation,
};

module.exports = platformDeps;
