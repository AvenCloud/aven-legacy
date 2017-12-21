const handlersById = {};
const handlerIdsByAccount = {};
const handlerIdsByProject = {};

const crypto = require("crypto");
const denodeify = require("denodeify");
const randomBytes = denodeify(crypto.randomBytes);
import Configuration from "./Configuration";

async function genClientId() {
  const randBuf = await randomBytes(48);
  const hex = randBuf.toString("hex");
  return hex;
}

const redis = require("redis");

const redisSubscriber = redis.createClient(Configuration.REDIS_URL);
const redisPublisher = redis.createClient(Configuration.REDIS_URL);

redisSubscriber.on("connect", () => {
  console.log("connected to redis event subscriber client!");
});
redisPublisher.on("connect", () => {
  console.log("connected to redis event publisher client!");
});
redisSubscriber.on("message", (channel, rootDoc) => {
  const channelParts = channel.split("_");
  const type = channelParts[0];
  const projectId = channelParts[1];
  if (type !== "Project") {
    return;
  }
  const handlerIds = handlerIdsByProject[projectId] || [];
  handlerIds.forEach(id => {
    const handler = handlersById[id];
    if (handler) {
      handler(`PublishProject_${projectId}_${rootDoc}`);
    }
  });
});

export default class SocketConnection {
  static init(wss) {
    wss.on("connection", async ws => {
      const clientId = await genClientId();

      handlersById[clientId] = msg => {
        ws.send(msg);
      };
      console.log("Client connected " + clientId);
      ws.on("message", data => {
        const msgParts = data.split("_");
        const msgType = msgParts[0];
        const arg0 = msgParts[1];
        // const accountHandlerIds =
        // 	handlerIdsByAccount[arg0] || (handlerIdsByAccount[arg0] = []);
        const projectHandlerIds =
          handlerIdsByProject[arg0] || (handlerIdsByProject[arg0] = []);
        const wasListening = !!projectHandlerIds.length;
        switch (msgType) {
          // case "ListenAccount":
          // 	console.log("ListenAccount", arg0);
          // 	if (accountHandlerIds.indexOf(clientId) === -1) {
          // 		accountHandlerIds.push(clientId);
          // 	}
          // 	break;
          case "ListenProject":
            if (projectHandlerIds.indexOf(clientId) === -1) {
              projectHandlerIds.push(clientId);
              if (!wasListening) {
                redisSubscriber.subscribe(`Project_${arg0}`);
              }
            }
            break;
          // case "UnlistenAccount":
          // 	console.log("UnlistenAccount", arg0);
          // 	const accountIndex = accountHandlerIds.indexOf(clientId);
          // 	if (accountIndex !== -1) {
          // 		accountHandlerIds.splice(accountIndex, 1);
          // 	}
          // 	break;
          case "UnlistenProject":
            const projectIndex = projectHandlerIds.indexOf(clientId);
            if (projectIndex !== -1) {
              projectHandlerIds.splice(projectIndex, 1);
              // todo: also remove projectHandlerIds whose handler has been removed
              if (wasListening && projectHandlerIds.length === 0) {
                redisSubscriber.unsubscribe(`Project_${arg0}`);
              }
            }
            break;
        }
      });
      ws.on("close", () => {
        console.log("Client disconnected ", clientId);
        delete handlersById[clientId];
      });
    });
  }

  static notifyAccount = (account, data) => {
    console.log("notifying account", account, data);
    const handlerIds = handlerIdsByAccount[account] || [];
    handlerIds.forEach(id => {
      handlersById[id](`PublishAccount_${account}`);
    });
  };

  static notifyProject = (projectId, rootDoc) => {
    console.log("notifying project", projectId, rootDoc);
    redisPublisher.publish(`Project_${projectId}`, rootDoc);
  };
}
