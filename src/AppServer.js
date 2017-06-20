require("babel-core/register");
require("babel-polyfill");

const bodyParser = require("body-parser");
const multer = require("multer")();
const express = require("express");
const http = require("http");
const path = require("path");
const SocketServer = require("ws").Server;
const cookieParser = require("cookie-parser");

import { getAuth } from "./AuthUtilities";
import Configuration from "./Configuration";
import DatabaseService from "./DatabaseService";
import DispatchAction from "./DispatchAction";
import NavigationActions from "./NavigationActions";
import HandleReactComponentGet from "./HandleReactComponentGet";
import NotFoundPage from "./NotFoundPage";
import HandleReactComponentForm from "./HandleReactComponentForm";
import HandleLogout from "./HandleLogout";

const app = express();

app.use((req, res, next) => {
  const proto = req.headers["x-forwarded-proto"] || req.protocol;

  if (Configuration.env === "development" || req.hostname === "localhost") {
    next();
    return;
  }

  if (req.hostname === "aven.io" && proto === "https") {
    next();
    return;
  }

  if (req.hostname === "www.aven.io") {
    res.redirect("https://aven.io" + req.path);
    return;
  }

  if (proto !== "https") {
    res.redirect("https://" + req.hostname + req.path);
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

app.get("/wstest", (req, res) => {
  res.send(
    `
<html>
  <body>
    <p id='server-time'></p>
    <script>
      var HOST = location.origin.replace(/^http/, 'ws')
      var ws = new WebSocket(HOST);
      var el = document.getElementById('server-time');
      ws.onmessage = function (event) {
        el.innerHTML = 'Server time: ' + event.data;
      };
    </script>
  </body>
</html>
`
  );
});

app.get("/debug", function(req, res) {
  res.send(JSON.stringify(Configuration.publicInfo));
});

app.post("/_inbound_mail", multer.single(), async (req, res) => {
  if (req.query.key !== Configuration.secrets.inbound_mail_key) {
    res.setStatus(400).send("Wrong inbound mail key");
    return;
  }
  const result = await DispatchAction({
    type: "EmailRecieveAction",
    data: req.body
  });
  res.send("hello kind email service");
});

app.use("/assets", express.static(path.join(__dirname, "../lib/static")));

let faviconHandler = express.static(
  path.join(__dirname, "../lib/static/favicon.prod.ico")
);
if (Configuration.env === "development") {
  faviconHandler = express.static(
    path.join(__dirname, "../lib/static/favicon.dev.ico")
  );
}

app.use("/favicon.ico", faviconHandler);

app.use(cookieParser());

app.post("/api/dispatch", bodyParser.json(), async (req, res) => {
  let action = req.body;
  if (req.cookies.user) {
    action = {
      ...action,
      user: req.cookies.user,
      session: req.cookies.session
    };
  }
  const result = await DispatchAction(action);
  res.send(result);
});

app.use(async (req, res, next) => {
  const { user, session } = req.cookies;
  req.auth = await getAuth(user, session);
  next();
});

function loadBrowserModule(moduleName) {
  console.log("loading browser moduoe", moduleName);
}

Object.keys(NavigationActions).forEach(actionName => {
  const navigationAction = NavigationActions[actionName];
  const { path, handler, component } = navigationAction;
  if (component && component.browserModule) {
    loadBrowserModule(component.browserModule);
  }
  let handlerToUse = HandleReactComponentGet;
  if (handler === "form") {
    handlerToUse = HandleReactComponentForm;
  } else if (handler === "logout") {
    handlerToUse = HandleLogout;
  }
  if (path) {
    console.log("foo", path);
    app.all(path, (req, res, next) => {
      console.log("using", path, req.path);
      handlerToUse(req, res, next, navigationAction);
    });
  }
});

app.use((req, res, next) =>
  HandleReactComponentGet(req, res, next, { component: NotFoundPage })
);

const server = http.createServer(app);
const wss = new SocketServer({ server });

wss.on("connection", ws => {
  console.log("Client connected");
  ws.on("close", () => console.log("Client disconnected"));
});

setInterval(() => {
  wss.clients.forEach(client => {
    client.send(new Date().toTimeString());
  });
}, 1000);

server.listen(Configuration.port, function() {
  console.log("Node app is running on port", Configuration.port);
});
