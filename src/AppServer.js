require("babel-core/register");
require("babel-polyfill");

const bodyParser = require("body-parser");
const multer = require("multer")();
const express = require("express");
const http = require("http");
const path = require("path");
const WSServer = require("ws").Server;
const cookieParser = require("cookie-parser");

import { getAuth } from "./AuthUtilities";
import SocketConnection from "./SocketConnection";
import Configuration from "./Configuration";
import DatabaseService from "./DatabaseService";
import DispatchAction from "./DispatchAction";
import NavigationActions from "./NavigationActions";
import HandleReactComponentGet from "./HandleReactComponentGet";
import NotFoundPage from "./NotFoundPage";
import HandleReactComponentForm from "./HandleReactComponentForm";
import HandleLogout from "./HandleLogout";

const app = express();

const { CommonTest } = require("./common");

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

app.get("/debug", function(req, res) {
  res.send(JSON.stringify(Configuration.publicInfo));
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

app.use(async (req, res, next) => {
  const { user, session } = req.cookies;
  if (req.headers["x-aven-auth-username"]) {
    req.auth = await getAuth(
      req.headers["x-aven-auth-username"],
      req.headers["x-aven-auth-session"]
    );
  } else {
    req.auth = await getAuth(user, session);
  }
  next();
});

app.post("/api/dispatch", bodyParser.json(), async (req, res) => {
  let action = req.body;
  if (req.auth) {
    action = {
      ...action,
      viewerUser: req.auth.user,
      viewerSession: req.auth.session
    };
  }
  try {
    const result = await DispatchAction(action);
    res.send(result);
  } catch (e) {
    res.status(500).send("Error: " + e);
  }
});

Object.keys(NavigationActions).forEach(actionName => {
  const navigationAction = NavigationActions[actionName];
  const { path, handler, component } = navigationAction;
  let handlerToUse = HandleReactComponentGet;
  if (handler === "form") {
    handlerToUse = HandleReactComponentForm;
  } else if (handler === "logout") {
    handlerToUse = HandleLogout;
  }
  if (path) {
    app.all(path, (req, res, next) => {
      handlerToUse(req, res, next, navigationAction);
    });
  }
});

app.use((req, res, next) =>
  HandleReactComponentGet(req, res, next, { component: NotFoundPage })
);

const server = http.createServer(app);
const wss = new WSServer({ server });

SocketConnection.init(wss);

// const _clientHandlers =

async function startServer() {
  await DatabaseService.wakeup();
  return new Promise((resolve, reject) => {
    server.listen(Configuration.port, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

startServer()
  .then(() => {
    console.log("App started on port " + Configuration.port);
  })
  .catch(err => {
    console.error("App failed to start!");
    throw err;
  });
