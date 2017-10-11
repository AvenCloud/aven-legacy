const join = require("path").join;
const fs = require("fs");
const commander = require("commander");
const prompt = require("prompt");
const denodeify = require("denodeify");
const { dispatch } = require("./CLI-utilities");

const fsExists = denodeify(fs.exists);
const fsMkdir = denodeify(fs.mkdir);
const fsWriteFile = denodeify(fs.writeFile);
const fsLstat = denodeify(fs.lstat);

// require("babel-core/register");
// require("babel-polyfill");

async function downloadFile(auth, projectUser, projectName, id, destPath) {
  console.log("downloading", auth, projectUser, projectName, id, destPath);
  const stat = await fsLstat(destPath);
  const doc = await dispatch(
    {
      type: "GetDocAction",
      user: projectUser,
      project: projectName,
      id
    },
    auth
  );
  console.log("homie", doc);
  if (doc.type === "Folder") {
    console.log("wat");
    if (!await fsExists(destPath)) {
      console.log("making!!", destPath);
      await fsMkdir(destPath);
    } else if (!stat.isDirectory()) {
      console.log("zzzzz!!", destPath);
      throw `${destPath} already exists and it is not a folder!`;
    }
    console.log("homie2");

    const fileNames = Object.keys(doc.files);
    console.log("homie4", fileNames);
    await Promise.all(
      fileNames.map(async fileName => {
        console.log("ding it!!", fileName);
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

  await fsWriteFile(destPath, JSON.stringify(doc));
}

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
