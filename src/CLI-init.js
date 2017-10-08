const join = require("path").join;
const fs = require("fs");
const commander = require("commander");
const prompt = require("prompt");
const denodeify = require("denodeify");
const { dispatch } = require("./CLI-utilities");

const fsExists = denodeify(fs.exists);
const fsMkdir = denodeify(fs.mkdir);
const fsWriteFile = denodeify(fs.writeFile);

require("babel-core/register");
require("babel-polyfill");

async function init(server, username, password, projectPath) {
  const projectUser = projectPath.split("/")[0];
  const projectName = projectPath.split("/")[1];
  const destFolder = join(process.cwd(), projectName);
  if (await fsExists(destFolder)) {
    throw "Folder already exists!";
  }
  const auth = {
    server
  };
  const loginResult = await dispatch(
    {
      type: "AuthLoginAction",
      username,
      password
    },
    auth
  );
  if (!loginResult || !loginResult.session) {
    throw "Login failed!";
  }
  auth.username = loginResult.username;
  auth.session = loginResult.session;
  auth.projectUser = projectUser;
  auth.projectName = projectName;
  const project = await dispatch(
    {
      type: "GetProjectAction",
      user: projectUser,
      project: projectName
    },
    auth
  );
  if (!project) {
    throw "cannot find project. create one plz";
  }
  await fsMkdir(destFolder);
  const configFile = join(destFolder, ".avenconfig");
  const configData = {
    server,
    username: loginResult.username,
    session: loginResult.session,
    projectName,
    projectUser
  };
  await fsWriteFile(configFile, JSON.stringify(configData));

  console.log("durr, ok. should download right now");
}

commander
  .version("0.1.0")
  .command(
    "init [user_and_project]",
    "Log in and create or download a new Aven project folder"
  )
  .option(
    "--server [protocol_and_host]",
    "Specify the aven server to point to",
    a => a,
    "https://aven.io"
  )
  .action(function(user_and_project) {
    prompt.get(
      {
        properties: {
          username: {
            description: "Registered Aven Username",
            type: "string",
            required: true
          },
          password: {
            description: "Password",
            type: "string",
            required: true,
            hidden: true
          }
        }
      },
      (err, result) => {
        if (err) {
          console.error("Invalid options input!");
          process.exit(1);
        }
        init(
          commander.server,
          result.username,
          result.password,
          user_and_project
        )
          .then(() => {
            console.log("Init completed!");
          })
          .catch(e => {
            console.log("Init failure!");
            console.error(e);
          });
      }
    );
  });

commander.parse(process.argv);
