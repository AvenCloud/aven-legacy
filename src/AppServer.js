require("babel-core/register");
require("babel-polyfill");

const bodyParser = require("body-parser");
const multer = require("multer")();
const express = require("express");
const http = require("http");
const SocketServer = require("ws").Server;
const cookieParser = require("cookie-parser");

import Configuration from "./Configuration";
import DatabaseService from "./DatabaseService";
import DispatchAction from "./DispatchAction";
import NavigationActions from "./NavigationActions";
import HandleReactComponentGet from "./HandleReactComponentGet";
import NotFoundPage from "./NotFoundPage";

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
  res.send(`
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
`);
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

app.use("/assets", express.static(__dirname + "/static"));

let faviconHandler = express.static(__dirname + "/static/favicon.prod.ico");
if (Configuration.env === "development") {
  faviconHandler = express.static(__dirname + "/static/favicon.dev.ico");
}

app.use("/favicon.ico", faviconHandler);

app.use(cookieParser());

app.use(async (req, res, next) => {
  req.authenticatedUser = null;
  const { username, session } = req.cookies;
  if (username && session) {
    const userDoc = await DatabaseService.getDoc(username);
    if (userDoc.sessions.indexOf(session) !== -1) {
      req.authenticatedUser = username;
      req.authenticatedSession = session;
      req.authenticatedUserDoc = userDoc;
    }
  }
  next();
});

app.post("/api/v1/dispatch", bodyParser.json(), async (req, res) => {
  const result = await DispatchAction(req.body);
  res.send(result);
});

Object.keys(NavigationActions).forEach(actionName => {
  const navigationAction = NavigationActions[actionName];
  const { path, handler } = navigationAction;
  const handlerToUse = handler || HandleReactComponentGet;
  if (path) {
    app.all(path, (req, res) => handlerToUse(req, res, navigationAction));
  }
});

app.use((req, res) =>
  HandleReactComponentGet(req, res, { Component: NotFoundPage })
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
