const fs = require("fs-extra");
const joinPath = require("path").join;
const Watchman = require("fb-watchman");
const { promisify } = require("bluebird");
const sleep = require("sleep-promise");

async function WatchmanAgent(fsAgent, infra) {
  const watchman = new Watchman.Client();
  const capabilityResult = await new Promise((resolve, reject) =>
    watchman.capabilityCheck(
      {
        optional: [],
        required: ["relative_root"],
      },
      (err, res) => (err ? reject(err) : resolve(res)),
    ),
  );
  if (!capabilityResult.capabilities.relative_root) {
    throw `Incompatible watchman client! (version ${capabilityResult.version})`;
  }

  const providedHandlers = new Map();

  async function provideDirectory(folder, recordID) {
    await fsAgent.provideDirectory(folder, recordID);

    if (providedHandlers.has(recordID)) {
      throw "already providing this record id";
    }

    const handlersForProvided = new Set();
    providedHandlers.set(recordID, handlersForProvided);

    const watchResult = await new Promise((resolve, reject) =>
      watchman.command(
        ["watch-project", folder],
        (err, res) => (err ? reject(err) : resolve(res)),
      ),
    );
    const subscribeResult = await new Promise((resolve, reject) =>
      watchman.command(
        [
          "subscribe",
          watchResult.watch,
          "mysubscription",
          {
            // expression: ["allof", ["match", "*.js"]],
            expression: ["allof", ["match", "*"]],
            fields: ["name", "size", "mtime_ms", "exists", "type"],
            relative_root: watchResult.relative_path
              ? watchResult.relative_path
              : undefined,
          },
        ],
        (err, res) => (err ? reject(err) : resolve(res)),
      ),
    );

    watchman.on("subscription", async resp => {
      if (resp.subscription !== "mysubscription") return;
      await fsAgent.invalidateDirectory(folder);

      const record = await fsAgent.dispatch({
        type: "GetRecordAction",
        recordID,
      });

      handlersForProvided.forEach(handler => handler(record));
    });
  }

  async function subscribe(recordID, handler) {
    const handlerSet = providedHandlers.get(recordID);
    if (handlerSet) {
      console.log("subscribing to ", recordID);
      handlerSet.add(handler);
      return;
    }
    fsAgent.subscribe(recordID, handler);
  }

  async function unsubscribe(recordID, handler) {
    const handlerSet = providedHandlers.get(recordID);
    if (handlerSet) {
      handlerSet.delete(handler);
      return;
    }
    fsAgent.unsubscribe(recordID, handler);
  }

  async function close() {
    watchman.end();
    fsAgent.close();
  }

  return {
    ...fsAgent,
    subscribe,
    unsubscribe,
    provideDirectory,
    close,
  };
}

module.exports = WatchmanAgent;
