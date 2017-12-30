const Watchman = require("fb-watchman")
const { promisify } = require("bluebird")
const FSClient = require("./FSClient")
const sleep = require("sleep-promise")

async function LocalClient(context) {
  const fsClient = await FSClient(context)
  const watchman = new Watchman.Client()
  const capabilityResult = await new Promise((resolve, reject) =>
    watchman.capabilityCheck(
      {
        optional: [],
        required: ["relative_root"],
      },
      (err, res) => (err ? reject(err) : resolve(res)),
    ),
  )
  if (!capabilityResult.capabilities.relative_root) {
    throw `Incompatible watchman client! (version ${capabilityResult.version})`
  }
  async function close() {
    watchman.end()
  }
  async function startLocal(folder, recordID) {
    const uploadResult = await fsClient.uploadPath(folder, recordID)

    const watchResult = await new Promise((resolve, reject) =>
      watchman.command(
        ["watch-project", folder],
        (err, res) => (err ? reject(err) : resolve(res)),
      ),
    )

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
    )

    console.log(
      "watch established on ",
      watchResult.watch,
      " relative_path",
      watchResult.relative_path,
      "and subscribed",
      subscribeResult.subscribe,
      "and uploaded",
      uploadResult.docID,
    )

    watchman.on("subscription", async resp => {
      if (resp.subscription !== "mysubscription") return
      console.log("wat omgz", resp.files.length)
      const uploadResult = await fsClient.uploadPath(folder, recordID)
      // resp.files.forEach(async (file) => {
      //   // convert Int64 instance to javascript integer
      //   // const mtime_ms = +file.mtime_ms
      //   // console.log("file changed! " + file.name, mtime_ms)
      // })
    })
  }
  return {
    ...fsClient,
    startLocal,
    close,
  }
}

module.exports = LocalClient
