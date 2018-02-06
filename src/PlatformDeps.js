const React = require("react");
const ReactDOM = require("react-dom");

const Platform = {
  web: true,
  webServer: true,
  webBrowser: false,
  mobile: false,
  os: "web",
};
const _platformDeps = {
  Platform,
  React,
  _npm_react: React,
  _npm_react_dom: ReactDOM,
  _npm_react_native: null,
};

module.exports = _platformDeps;
