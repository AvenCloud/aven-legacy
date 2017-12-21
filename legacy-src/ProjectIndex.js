const React = require("react");
const ReactDOM = require("react-dom");

const path = window.location.pathname;
const host = window.location.protocol + "//" + window.location.host;
const query = window.location.query;

import ProjectPage from "./ProjectPage";

require("babel-core/register");
require("babel-polyfill");

async function dispatch(action) {
  const result = await fetch("/api/dispatch", {
    method: "POST",
    body: JSON.stringify(action),
    headers: {
      "Content-Type": "application/json"
    },
    credentials: "include"
  });
  if (result.status !== 200) {
    throw await result.text();
  }
  const resultJSON = await result.json();
  return resultJSON;
}

const { Store } = require("./common");
const Cookie = require("js-cookie");

const sessionDoc = {
  username: Cookie.get("user"),
  session: Cookie.get("session"),
  host: window.location.host,
  isSecure: window.location.protocol === "https:"
};

window.store = Store;

Store.init({
  platformDeps: {
    ReactNative: null,
    ReactWeb: true,
    React,
    Platform: {
      os: "web",
      select: obj => ("web" in obj ? obj.web : obj.default)
    }
  },
  localStorage: {
    setItem: async (name, data) => {
      window.localStorage.setItem(name, data);
    },
    clear: async () => {
      window.localStorage.clear();
    },
    getItem(localId) {
      // this is kind of a hack with a hardcoded string:
      if (localId === "AvenDocument_Session") {
        return sessionDoc;
      }
      return window.localStorage.getItem(localId);
    }
  }
});

ReactDOM.render(
  <ProjectPage
    dispatch={dispatch}
    data={pageProps.data}
    path={path}
    params={pageProps.params}
  />,
  document.getElementById("aven-app")
);
