import "babel-polyfill";

const Server = require("./Server");

const reportError = type => e => {
  console.error(`App Failed to ${type}`);
  console.error(e);
  process.exit(1);
};

const reportSuccess = type => () => {
  console.error(`${type} Succeeded`);
  type !== "Startup" && process.exit(0);
};

Server()
  .then(closeServer => {
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
  .then(reportSuccess("Startup"))
  .catch(reportError("Startup"));
