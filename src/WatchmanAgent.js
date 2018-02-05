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

  async function provideDirectory(folder, recordID) {
    return await fsAgent.provideDirectory(folder, recordID);

    // const watchResult = await new Promise((resolve, reject) =>
    //   watchman.command(
    //     ["watch-project", folder],
    //     (err, res) => (err ? reject(err) : resolve(res)),
    //   ),
    // );
    // const subscribeResult = await new Promise((resolve, reject) =>
    //   watchman.command(
    //     [
    //       "subscribe",
    //       watchResult.watch,
    //       "mysubscription",
    //       {
    //         // expression: ["allof", ["match", "*.js"]],
    //         expression: ["allof", ["match", "*"]],
    //         fields: ["name", "size", "mtime_ms", "exists", "type"],
    //         relative_root: watchResult.relative_path
    //           ? watchResult.relative_path
    //           : undefined,
    //       },
    //     ],
    //     (err, res) => (err ? reject(err) : resolve(res)),
    //   ),
    // );

    // watchman.on("subscription", async resp => {
    //   if (resp.subscription !== "mysubscription") return;
    //   // Our files has changed!! Do something htere plz now feb18
    // });
  }

  async function close() {
    watchman.end();
    fsAgent.close();
  }

  return {
    ...fsAgent,
    provideDirectory,
    close,
  };
}

module.exports = WatchmanAgent;
