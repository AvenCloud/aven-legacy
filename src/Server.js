const FSAgent = require("./FSAgent");
const CreateAgentServer = require("./CreateAgentServer");
const DBAgent = require("./DBAgent");
const ExecServerApp = require("./ExecServerApp");
const WatchmanAgent = require("./WatchmanAgent");
const Infra = require("./Infra");
const ExecAgent = require("./ExecAgent");
const joinPath = require("path").join;
const LOCAL_APP_PATH = joinPath(process.cwd(), "app");
const MAIN_APP_NAME = "App";

const IS_DEV = process.env.NODE_ENV === "development";

module.exports = async () => {
  const infra = await Infra({});
  const dbAgent = await DBAgent(infra);

  const fsAgent = await FSAgent(dbAgent, infra);
  const appAgent = IS_DEV ? await WatchmanAgent(fsAgent, infra) : fsAgent;
  // const appAgent = await AuthAgent(fsAgent, infra);

  const app = await CreateAgentServer(appAgent, infra);

  const execAgent = await ExecAgent(appAgent, infra);

  appAgent.provideDirectory(LOCAL_APP_PATH, MAIN_APP_NAME);

  app.get("*", async (req, res) => {
    try {
      await ExecServerApp(execAgent, req, res, MAIN_APP_NAME);
    } catch (e) {
      console.log("Error:", e);
      res
        .status(e.statusCode || 500)
        .json({ message: e.message, type: e.type });
    }
  });

  console.log("Started on " + infra.hostURI);

  const close = async () => {
    await app.close();
    await appAgent.close();
    await infra.close();
  };

  return close;
};
