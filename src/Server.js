const FSAgent = require("./FSAgent");
const CreateAgentServer = require("./CreateAgentServer");
const DBAgent = require("./DBAgent");
const ServerApp = require("./ServerApp");
const WatchmanAgent = require("./WatchmanAgent");
const Infra = require("./Infra");
const fs = require("fs-extra");
const ExecAgent = require("./ExecAgent");
const HelperAgent = require("./HelperAgent");
const joinPath = require("path").join;
const DEFAULT_MAIN_APP_PATH = joinPath(process.cwd(), "app");
const FRAMEWORK_PATH = joinPath(__dirname, "../framework");
const APP_RECORD = "App";
const FRAMEWORK_RECORD = "Framework";
const { promisify } = require("bluebird");
const execFile = promisify(require("child_process").execFile);
let prodClientAppCache = null;
const CLIENT_APP_SRC = joinPath(__dirname, "BrowserApp.js");
const CLIENT_APP = joinPath(__dirname, "../dist/BrowserApp.bundle.js");
const PlatformDeps = require("./PlatformDeps");

module.exports = async options => {
  const infra = await Infra({
    dbPath: options.dbPath || ".AvenDB.sqlite",
  });
  const dbAgent = await DBAgent(infra);

  const fsAgent = await FSAgent(dbAgent, infra);
  const isDev = process.env.NODE_ENV === "development";
  const isLocal = process.env.NODE_ENV === "local";

  const watchingAgent =
    isDev || isLocal ? await WatchmanAgent(fsAgent, infra) : fsAgent;

  const appAgent = await HelperAgent(watchingAgent);
  // const appAgent = await AuthAgent(fsAgent, infra);

  const routing = app => {
    app.use((req, res, next) => {
      next();
    });
  };
  const app = await CreateAgentServer(appAgent, infra, routing);
  app.infra = infra;
  const execAgent = await ExecAgent(appAgent, PlatformDeps);

  const appDirectory =
    options.appDir || process.env.MAIN_APP_PATH || DEFAULT_MAIN_APP_PATH;

  if (isDev) {
    // now developing aven itself. watch for changes in framework and app code
    await appAgent.provideDirectory(FRAMEWORK_PATH, FRAMEWORK_RECORD);
    await appAgent.provideDirectory(appDirectory, APP_RECORD);
  } else if (isLocal) {
    // user is running locally via npm script. framework will not change.
    await fsAgent.provideDirectory(FRAMEWORK_PATH, FRAMEWORK_RECORD);
    await appAgent.provideDirectory(appDirectory, APP_RECORD);
  } else {
    // prod. serve from fs agent
    await fsAgent.provideDirectory(FRAMEWORK_PATH, FRAMEWORK_RECORD);
    await fsAgent.provideDirectory(appDirectory, APP_RECORD);
  }

  app.get("/_client_app.js", async (req, res) => {
    const { host, useSSL } = appAgent.env;
    res.set({
      "Access-Control-Allow-Origin": `http${useSSL ? "s" : ""}://${host}`,
      "Content-Type": "application/javascript; charset=utf-8",
    });

    if (isDev) {
      await execFile("./scripts/build.sh");
      const built = await fs.readFile(CLIENT_APP, {
        encoding: "utf8",
      });
      res.send(built);
    } else {
      if (!prodClientAppCache) {
        prodClientAppCache = await fs.readFile(CLIENT_APP, {
          encoding: "utf8",
        });
      }
      res.send(prodClientAppCache);
    }
  });

  app.get("*", async (req, res) => {
    try {
      await ServerApp(execAgent, req, res, APP_RECORD);
    } catch (e) {
      console.log("Error:", e);
      res
        .status(e.statusCode || 500)
        .json({ message: e.message, type: e.type });
    }
  });

  console.log("Started on " + infra.hostURI);

  const closeServer = async () => {
    await app.close();
    await appAgent.close();
    await infra.close();
  };

  return { closeServer, app };
};
