const App = require("./App");
const Infra = require("./Infra");

const port = process.env.PORT || 3000;

Infra({port}).then(infra => App(infra)).then(app => {
  console.log("Started on http://localhost:" + port);

  process.on("SIGTERM", () => {
    app
      .close()
      .then(() => {
        console.log("App Cleanly Shut Down. \n\n");
        process.exit(0);
      })
      .catch(e => {
        console.error("App Shut Down with Error: ", e);
        process.exit(1);
      });
  });

  process.on("SIGINT", () => {
    app
      .close()
      .then(() => {
        console.log("App Cleanly Interrupted. \n\n");
        process.exit(0);
      })
      .catch(e => {
        console.error("App Interrupted with Error: ", e);
        process.exit(1);
      });
  });

  process.on("SIGQUIT", () => {
    app
      .close()
      .then(() => {
        console.log("App Cleanly Quit. \n\n");
        process.exit(0);
      })
      .catch(e => {
        console.error("App Quit with Error: ", e);
        process.exit(1);
      });
  });
});
