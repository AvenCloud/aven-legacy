const express = require("express");
const DB = require("./DB");
const LocalAppLoader = require("./LocalAppLoader");
const ExecServerApp = require("./ExecServerApp");
const bodyParser = require("body-parser");
const createDispatcher = require("./Dispatch");
const http = require("http");
const WSServer = require("ws").Server;
const randomBytes = require("bluebird").promisify(
  require("crypto").randomBytes,
);

async function genClientId() {
  const randBuf = await randomBytes(48);
  const hex = randBuf.toString("hex");
  return hex;
}

module.exports = async infra => {
  const app = express();

  const appServer = http.createServer(app);

  const wss = new WSServer({
    server: appServer,
  });

  const handlersById = new Map();
  const subscriptionChannels = new Map();
  const getSubscriptionChannelSubscribers = channel =>
    subscriptionChannels.has(channel)
      ? subscriptionChannels.get(channel)
      : subscriptionChannels.set(channel, new Set()).get(channel);
  wss.on("connection", async ws => {
    const clientID = await genClientId();
    handlersById.set(clientID, msg => {
      ws.send(msg);
    });
    ws.on("message", data => {
      const payload = JSON.parse(data);
      if (payload.type === "subscribe") {
        const subscribedClients = getSubscriptionChannelSubscribers(
          payload.recordID,
        );
        subscribedClients.add(clientID);
      }
      if (payload.type === "unsubscribe") {
        const subscribedClients = getSubscriptionChannelSubscribers(
          payload.recordID,
        );
        subscribedClients.remove(clientID);
      }
    });
    ws.on("close", () => {
      handlersById.delete(clientID);
    });
    handlersById.get(clientID)(JSON.stringify({ type: "Greet", clientID }));
  });
  app.notify = (recordID, payload) => {
    const subscribedClients = getSubscriptionChannelSubscribers(recordID);
    subscribedClients.forEach(clientID => {
      const handler = handlersById.get(clientID);
      handler && handler(JSON.stringify(payload));
    });
  };
  app.infra = infra;
  app.model = DB.create(infra);

  app.dispatch = createDispatcher(app);

  app.get("/api/debug", async (req, res) => {
    res.json(await infra.getPublicDebugInfo());
  });

  app.post("/api/dispatch", bodyParser.json(), async (req, res) => {
    let result = null;
    const action = req.body;
    try {
      result = await app.dispatch(action);
      res.json(result);
    } catch (e) {
      // avoid logging expected errors during test runs:
      if (
        infra.env !== "testing" ||
        req.headers["x-aven-test"] !== "expect-error"
      ) {
        console.error(e);
      }
      res.status(e.statusCode || 500).json(e);
    }
  });

  app.get("*", async (req, res) => {
    try {
      await ExecServerApp(app, req, res);
    } catch (e) {
      console.log("Error:", e);
      res
        .status(e.statusCode || 500)
        .json({ message: e.message, type: e.type });
    }
  });

  const server = await new Promise((resolve, reject) => {
    const httpServer = appServer.listen(infra.appListenPort, err => {
      if (err) {
        reject(err);
      } else {
        resolve(httpServer);
      }
    });
  });

  let closeLocalLoader = () => {};
  if (process.env.NODE_ENV === "development" && !process.env.JEST_TEST) {
    try {
      closeLocalLoader = await LocalAppLoader.start(app);
    } catch (e) {
      console.error("Could not load local 'app' folder!", e);
    }
  }

  app.close = async () => {
    await closeLocalLoader();
    await infra.close();
    await new Promise((resolve, reject) => {
      server.close(function(err) {
        if (err) {
          reject(err);
        } else {
          setTimeout(() => {
            resolve();
          }, 200);
        }
      });
    });
  };

  return app;
};
