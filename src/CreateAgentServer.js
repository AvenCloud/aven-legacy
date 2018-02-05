const express = require("express");
const bodyParser = require("body-parser");
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

const CreateAgentServer = async (agent, infra) => {
  const app = express();

  const handlersById = new Map();
  const subscriptionChannels = new Map();
  const getSubscriptionChannelSubscribers = channel =>
    subscriptionChannels.has(channel)
      ? subscriptionChannels.get(channel)
      : subscriptionChannels.set(channel, new Set()).get(channel);
  const onWSSConnection = async ws => {
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
  };
  app.notify = (recordID, payload) => {
    const subscribedClients = getSubscriptionChannelSubscribers(recordID);
    subscribedClients.forEach(clientID => {
      const handler = handlersById.get(clientID);
      handler && handler(JSON.stringify(payload));
    });
  };
  app.infra = infra;
  app.model = infra.model;

  app.agent = agent;

  app.get("/api/debug", async (req, res) => {
    res.json(await infra.getPublicDebugInfo());
  });

  app.post("/api/dispatch", bodyParser.json(), async (req, res) => {
    let result = null;
    const action = req.body;
    try {
      result = await agent.dispatch(action);
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

  const appServer = http.createServer(app);

  const wss = new WSServer({
    server: appServer,
  });
  wss.on("connection", onWSSConnection);

  const httpServer = await new Promise((resolve, reject) => {
    const s = appServer.listen(infra.appListenPort, err => {
      if (err) {
        reject(err);
      } else {
        resolve(s);
      }
    });
  });

  app.close = async () => {
    await new Promise((resolve, reject) => {
      httpServer.close(err => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  };

  return app;
};

module.exports = CreateAgentServer;
