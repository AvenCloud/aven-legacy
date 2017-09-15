const fetch = require("node-fetch");
const homedir = require("os").homedir();
const join = require("path").join;
const fs = require("fs");
const commander = require("commander");
const prompt = require("prompt");

async function init(server, username, password, project) {
  const destFolder = fs.new;
  let configData = {};
  try {
    configData = Object.assign({}, JSON.parse(fs.readFileSync(configFile)));
  } catch (e) {}
  const loginResult = await dispatch(
    {
      type: "AuthLoginAction",
      username,
      password
    },
    {
      server
    }
  );

  if (!actionResult || !actionResult.session) {
    console.error("Login failed!");
    process.exit(1);
  }
  configData.username = actionResult.username;
  configData.session = actionResult.session;
  configData.server = server;
  fs.writeFileSync(configFile, JSON.stringify(configData));
  console.log("Login successful!");
}

const defaultConfigFile = join(homedir, ".avenconfig");

commander
  .version("0.1.0")
  .command("init", "Log in and create or download a new Aven project folder")
  .option(
    "--server [protocol_and_host]",
    "Specify the aven server to point to",
    a => a,
    "https://aven.io"
  )
  .action(function(username) {
    prompt.get(
      {
        properties: {
          username: {
            description: "Aven username, must already be registered",
            type: "string",
            required: true
          },
          password: {
            description: "Enter your password",
            type: "string",
            required: true,
            hidden: true
          },
          project: {
            description: "Project name (new or existing)",
            type: "string",
            required: true
          }
        }
      },
      (err, result) => {
        if (err) {
          console.error("Invalid options input!");
          process.exit(1);
        }
        init(commander.server, result.username, result.password, result.project)
          .then(() => {
            console.log("Init completed!");
          })
          .catch(() => {
            console.log("Init failure!");
          });
      }
    );
  });

commander.parse(process.argv);
