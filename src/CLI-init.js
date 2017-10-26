const join = require("path").join;
const fs = require("fs");
const commander = require("commander");
const prompt = require("prompt");
const denodeify = require("denodeify");
const { dispatch } = require("./CLI-utilities");

const fsExists = dir => new Promise((resolve, reject) => fs.exists(dir, doesExist => resolve(doesExist)));
const fsMkdir = denodeify(fs.mkdir);
const fsWriteFile = denodeify(fs.writeFile);
const fsLstat = denodeify(fs.lstat);

require("babel-core/register");
require("babel-polyfill");

async function downloadFile(auth, projectUser, projectName, id, destPath) {
  console.log(`Downloading ${id} to ${destPath}`);
  let stat = null;
  if (await fsExists(destPath)) {
    stat = await fsLstat(destPath);
  }
  let doc = null;
  try {
   doc = await dispatch(
    {
      type: "GetDocAction",
      user: projectUser,
      project: projectName,
      id
    },
    auth
  );
} catch(e) {
  console.error('woah there buddy', e);
}
  if (doc.type === "Folder") {
    if (!await fsExists(destPath)) {
      await fsMkdir(destPath);
    } else if (!stat.isDirectory()) {
      throw `${destPath} already exists and it is not a folder!`;
    }

    const fileNames = Object.keys(doc.files);
    await Promise.all(
      fileNames.map(async fileName => {
        const file = doc.files[fileName];
        return await downloadFile(
          auth,
          projectUser,
          projectName,
          file.value,
          `${destPath}/${fileName}`
        );
      })
    );
    return;
  }

  const fileData = JSON.stringify(doc);

  await fsWriteFile(destPath, fileData);
}

async function init({server, username, password, projectId}) {
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
    a => a,
  )
  .option(
    "--password [secret]",
    "INSECURE! FOR TESTING ONLY: provide your password in PLAINTEXT to log in",
    a => a,
  )
  .action(function(projectId) {
    const initData = {
      projectId,
      server: commander.server,
      password: commander.password,
      username: commander.username,
    };
    if (initData.password && initData.username) {
      init(initData).then(() => {
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
