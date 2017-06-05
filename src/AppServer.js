require("babel-core/register");
require("babel-polyfill");

const bodyParser = require("body-parser");
const express = require("express");
const app = express();

import Configuration from "./Configuration";
import DispatchAction from "./DispatchAction";
import NavigationActions from "./NavigationActions";
import ReactComponentHandleGet from "./ReactComponentHandleGet";
import NotFoundPage from "./NotFoundPage";

app.get("/debug", function(req, res) {
  res.send(JSON.stringify(Configuration.publicInfo));
});

app.post("/api/v1/dispatch", bodyParser.json(), async (req, res) => {
  const result = await DispatchAction(req.body);
});

app.post(
  "/_inbound_mail",
  bodyParser.urlencoded({ extended: false }),
  async (req, res) => {
    const result = await DispatchAction({
      type: "EmailRecieveAction",
      data: req.body
    });
    res.send("hello kind email service");
  }
);

app.use("/assets", express.static(__dirname + "/static"));

Object.keys(NavigationActions).forEach(actionName => {
  const { path, handler, component } = NavigationActions[actionName];
  const handlerToUse = handler || ReactComponentHandleGet;
  const runIt = handlerToUse(component);
  if (path) {
    app.all(path, runIt);
  }
});

app.use(ReactComponentHandleGet(NotFoundPage));

app.listen(Configuration.port, function() {
  console.log("Node app is running on port", Configuration.port);
});
