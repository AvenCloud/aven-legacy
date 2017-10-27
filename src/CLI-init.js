const join = require("path").join;
const commander = require("commander");
const prompt = require("prompt");
const {
  dispatch,
  downloadFile,
  fsWriteFile,
  fsMkdir,
  fsExists
} = require("./CLI-utilities");

require("babel-core/register");
require("babel-polyfill");

async function init({ server, username, password, projectId }) {
  const projectUser = projectId.split("/")[0];
  const projectName = projectId.split("/")[1];
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

  if (!project.rootDoc) {
    console.log("Project initialized but seems to be empty");
    return;
  }

  await downloadFile(
    auth,
    projectUser,
    projectName,
    project.rootDoc,
    destFolder
  );
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
  .option(
    "--username [user]",
    "Specify your username who is allowed to see this project",
    a => a
  )
  .option(
    "--password [secret]",
    "INSECURE! FOR TESTING ONLY: provide your password in PLAINTEXT to log in",
    a => a
  )
  .action(function(projectId) {
    const initData = {
      projectId,
      server: commander.server,
      password: commander.password,
      username: commander.username
    };
    if (initData.password && initData.username) {
      init(initData)
        .then(() => {
          console.log("Init completed!");
        })
        .catch(e => {
          console.log("Init failure!");
          console.error(e);
        });
      return;
    }
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
        if (result.username) {
          initData.username = result.username;
        }
        if (result.password) {
          initData.password = result.password;
        }
        init(initData)
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
