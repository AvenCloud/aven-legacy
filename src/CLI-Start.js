const Server = require("./Server");
const open = require("open");
const fs = require("fs-extra");
const path = require("path");
const execFileSync = require("child_process").execFileSync;
const spawnAsync = require("@expo/spawn-async");

async function runStart() {
  process.env.NODE_ENV = "local";
  const avenContextPath = path.join(process.cwd(), "AvenContext.json");
  const avenContextJSON = await fs.readFile(avenContextPath, {
    encoding: "utf8",
  });
  const avenContext = JSON.parse(avenContextJSON);

  const options = {
    env: "local",
    appDir: process.cwd(),
    ...avenContext,
  };

  const reportError = type => e => {
    console.error(`App Failed to ${type}`);
    console.error(e);
    process.exit(1);
  };

  const reportSuccess = type => () => {
    console.error(`${type} Succeeded`);
    type !== "Startup" && process.exit(0);
  };

  Server(options)
    .then(({ closeServer }) => {
      process.on("SIGTERM", () => {
        closeServer()
          .then(reportSuccess("Shut Down"))
          .catch(reportError("Shut Down"));
      });
      process.on("SIGINT", () => {
        closeServer()
          .then(reportSuccess("Interrupt"))
          .catch(reportError("Interrupt"));
      });
      process.on("SIGQUIT", () => {
        closeServer()
          .then(reportSuccess("Quit"))
          .catch(reportError("Quit"));
      });
    })
    .then(() => {
      open("http://localhost:3000/");
    })
    .catch(reportError("Startup"));
}

module.exports = runStart;
