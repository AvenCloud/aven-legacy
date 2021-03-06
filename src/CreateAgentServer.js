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

const CreateAgentServer = async (agent, infra, routing) => {
  const app = express();

  routing(app);

  const onWSSConnection = async ws => {
    const clientID = await genClientId();
    let recordHandlers = new Map();
    let isConnected = true;
    ws.on("error", e => {
      console.error("WSConnection Error:", clientID, e);
    });
    ws.on("message", data => {
      const payload = JSON.parse(data);
      const { recordID } = payload;
      if (payload.type === "subscribe") {
        if (recordHandlers.get(recordID)) {
          return;
        }
        const handler = record => {
          if (!isConnected) {
            return;
          }
          ws.send(JSON.stringify(record));
        };
        recordHandlers.set(recordID, handler);
        agent.subscribe(recordID, handler);
      } else if (payload.type === "unsubscribe") {
        const handler = recordHandlers.get(recordID);
        agent.unsubscribe(recordID, handler);
        recordHandlers.delete(recordID);
      }
    });
    ws.on("close", () => {
      isConnected = false;
      recordHandlers.forEach((recordID, handler) => {
        agent.unsubscribe(recordID, handler);
        recordHandlers.delete(recordID);
      });
      recordHandlers = null;
    });
  };

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
        console.error(JSON.stringify(e));
      }
      res.status(e.statusCode || 500).json(e);
    }
  });

  const appServer = http.createServer(app);

  const wss = new WSServer({
    server: appServer,
  });
  wss.on("connection", onWSSConnection);
  wss.on("error", e => {
    console.error("WSServer Error:", e);
  });

  let httpServer = null;
  if (infra.env !== "testing") {
    httpServer = await new Promise((resolve, reject) => {
      const s = appServer.listen(infra.appListenPort, err => {
        console.log("Started on " + infra.hostURI);

        if (err) {
          reject(err);
        } else {
          resolve(s);
        }
      });
    });
  }

  app.close = async () => {
    await new Promise((resolve, reject) => {
      if (!httpServer) {
        resolve();
      }
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
