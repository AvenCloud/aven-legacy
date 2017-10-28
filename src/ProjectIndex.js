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

const { CommonTest } = require("./common");
console.log("ey, yo browzer!", CommonTest("evv"));

ReactDOM.render(
  <ProjectPage
    dispatch={dispatch}
    data={pageProps.data}
    path={path}
    params={pageProps.params}
  />,
  document.getElementById("aven-app")
);
