require("babel-core/register");
require("babel-polyfill");

const bodyParser = require("body-parser");
const multer = require("multer")();
const express = require("express");
const http = require("http");
const path = require("path");
const WSServer = require("ws").Server;
const cookieParser = require("cookie-parser");

import SocketConnection from "./SocketConnection";
import Configuration from "./Configuration";
import DB from "./DB";
import DispatchAction from "./DispatchAction";
import NavigationActions from "./NavigationActions";
import HandleReactComponentGet from "./HandleReactComponentGet";
import NotFoundPage from "./NotFoundPage";
import HandleReactComponentForm from "./HandleReactComponentForm";
import HandleLogout from "./HandleLogout";

const app = express();

const {
  CommonTest
} = require("./common");

const SITE_HOST = "aven.io";

app.use((req, res, next) => {
  const proto = req.headers["x-forwarded-proto"] || req.protocol;

  // dev routing
  if (Configuration.env === "development" || req.hostname === "localhost") {
    next();
    return;
  }

  // normal production routing
  if (req.hostname === SITE_HOST && proto === "https") {
    next();
    return;
  }

  // handle "www" redirect
  if (req.hostname === `www.${SITE_HOST}`) {
    res.redirect(`https://${SITE_HOST}` + req.path);
    return;
  }

  // ensure https for production host and subdomains
  if (proto !== "https") {
    res.redirect(`https://${req.hostname}${req.path}`);
    return;
  }

  // handle production subdomains
  const matchesSubdomain = req.hostname.match(`(.*).${SITE_HOST}$`);
  if (matchesSubdomain) {
    res.send("Subdomains are not yet supported. Stay tuned!");
    return;
  }

  // finally handle random cases that are not subdomains, like foo.herokuapp.com
  res.redirect(`https://${SITE_HOST}${req.path}`);
});

app.get("/debug", function (req, res) {
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

app.post("/api/dispatch", bodyParser.json(), async(req, res) => {
  const action = req.body;
  try {
    const result = await DispatchAction(action);
    res.send(result);
  } catch (e) {
    res.status(500).send("Error: " + e);
  }
});

Object.keys(NavigationActions).forEach(actionName => {
  const navigationAction = NavigationActions[actionName];
  const {
    path,
    handler,
    component
  } = navigationAction;
  let handlerToUse = HandleReactComponentGet;
  if (handler === "form") {
    handlerToUse = HandleReactComponentForm;
  } else if (handler === "logout") {
    handlerToUse = HandleLogout;
  }
  if (path) {
    app.all(path, (req, res, next) => {

      const {
        user,
        session
      } = req.cookies;
      // todo, use user and session for internal dispatches within this:
      handlerToUse(req, res, next, navigationAction);
    });
  }
});

app.use((req, res, next) => {
  const {
    user,
    session
  } = req.cookies;
  // todo, use user and session for internal dispatches within this:
  HandleReactComponentGet(req, res, next, {
    component: NotFoundPage
  })
});

const server = http.createServer(app);
const wss = new WSServer({
  server
});

SocketConnection.init(wss);

async function startServer() {
  await DB.init();
  return new Promise((resolve, reject) => {
    server.listen(Configuration.port, function (err) {
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