require("babel-core/register");
require("babel-polyfill");

const bodyParser = require("body-parser");
const multer = require("multer")();
const express = require("express");
const app = express();

import Configuration from "./Configuration";
import DispatchAction from "./DispatchAction";
import NavigationActions from "./NavigationActions";
import ReactComponentHandleGet from "./ReactComponentHandleGet";
import NotFoundPage from "./NotFoundPage";

app.use((req, res, next) => {
  const proto = req.headers["x-forwarded-proto"] || req.protocol;
  console.log({env: Configuration.env, hostname: req.hostname, proto, reqProto: req.protocol })
  if (Configuration.env === "development" || req.hostname === "localhost") {
    next();
    return;
  }
  if (req.hostname === "aven.io" && req.protocol === "https") {
    next();
    return;
  }
  if (req.hostname === "www.aven.io") {
    res.redirect("https://aven.io" + req.path);
    return;
  }
  if (proto !== "https") {
    console.log("wtf", proto, req.headers, req.protocol);
    // res.redirect("https://" + req.hostname + req.path);
    next();
    return;
  }

  const matchesSubdomain = req.hostname.match("(.*).aven.io$");
  if (matchesSubdomain) {
    res.send("Subdomains are not yet supported. Stay tuned!");
    return;
  }
  // finally we handle random cases that are not subdomains, like aven-prod.herokuapp.com
  res.redirect("https://aven.io" + req.path);
});

app.get("/debug", function(req, res) {
  res.send(JSON.stringify(Configuration.publicInfo));
});

app.post("/api/v1/dispatch", bodyParser.json(), async (req, res) => {
  const result = await DispatchAction(req.body);
});

app.post("/_inbound_mail", multer.single(), async (req, res) => {
  const result = await DispatchAction({
    type: "EmailRecieveAction",
    data: req.body
  });
  res.send("hello kind email service");
});

app.use("/assets", express.static(__dirname + "/static"));

let faviconHandler = express.static(__dirname + "/static/favicon.prod.ico");
if (Configuration.env === "development") {
  faviconHandler = express.static(__dirname + "/static/favicon.dev.ico");
}

app.use("/favicon.ico", faviconHandler);

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
