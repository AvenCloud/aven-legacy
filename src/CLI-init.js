const fs = require("fs-extra");
const chalk = require("chalk");
const path = require("path");
const inquirer = require("inquirer");
const Sequelize = require("sequelize");
const DB = require("./DB");
const { genHash, genSessionId } = require("./Utilities");

const DB_TEMPLATE = path.join(__dirname, "../AvenDBTemplate.sqlite");

async function runInitConnect(pkg) {
  const hostAnswer = await inquirer.prompt([
    {
      name: "host",
      type: "input",
      message: "What server?",
      default: "https://aven.io",
    },
  ]);
  let host = null;
  let useSSL = false;
  if (hostAnswer.host.substr(0, 8) === "https://") {
    useSSL = true;
    host = hostAnswer.host.substr(8);
  } else if (hostAnswer.host.substr(0, 7) === "http://") {
    useSSL = false;
    host = hostAnswer.host.substr(7);
  } else {
    throw "Invalid host, must start with http:// or https://";
  }
  const avenContext = {
    host,
    useSSL,
    // authUserID: "root",
    // authUserSession,
  };
  pkg.scripts = {
    start: "aven start",
  };

  await fs.writeFile(pkgJsonPath, JSON.stringify(pkg, null, 2));
  await fs.writeFile(avenContextPath, JSON.stringify(avenContext, null, 2));

  console.log("done!", avenContext);
}

const appPath = process.cwd();
const defaultAppPath = path.join(__dirname, "../default-app");
const gitIgnorePath = path.join(appPath, ".gitignore");
const pkgJsonPath = path.join(appPath, "package.json");
const avenContextPath = path.join(appPath, "AvenContext.json");

async function runInit() {
  const pkgJson = await fs.readFile(pkgJsonPath, { encoding: "utf8" });
  const pkg = { ...JSON.parse(pkgJson) };

  const answers = await inquirer.prompt([
    {
      name: "mode",
      type: "list",
      message: "Would you like to create a local server, or connect to one?",
      choices: [
        { name: "local server", value: "local", short: "local" },
        { name: "connect to server", value: "connect", short: "connect" },
      ],
    },
  ]);
  if (answers.mode === "connect") {
    return await runInitConnect(pkg);
  }

  await fs.copy(DB_TEMPLATE, "./.AvenDB.sqlite");

  // todo, maybe share this code with Infra.js
  const sequelize = new Sequelize({
    dialect: "sqlite",
    storage: "./.AvenDB.sqlite",
  });
  const model = DB.createModel(sequelize);
  const rootPassword = await genSessionId();
  await model.user.create({
    displayName: "Root User",
    password: await genHash(rootPassword),
    id: "root",
  });
  const sessionId = await genSessionId();
  const sessionSecret = await genSessionId();
  const logoutToken = await genSessionId();
  const authUserSession = `${sessionId}-${sessionSecret}`;
  await model.authMethod.create({
    id: "RootAuthMethod",
    type: "EMAIL",
    owner: "root",
    primaryOwner: "root",
    verificationKey: null,
    verificationExpiration: null,
  });
  await model.userSession.create({
    id: sessionId,
    user: "root",
    secret: await genHash(sessionSecret),
    logoutToken: await genHash(logoutToken),
    ip: "127.0.0.1",
    authMethod: "RootAuthMethod",
  });

  const avenContext = {
    host: "localhost",
    localStorage: ".AvenDB.sqlite",
    authUserID: "root",
    authUserSession,
  };
  pkg.scripts = {
    start: "aven start",
  };

  await fs.writeFile(pkgJsonPath, JSON.stringify(pkg, null, 2));
  await fs.writeFile(avenContextPath, JSON.stringify(avenContext, null, 2));

  const defaultFiles = await fs.readdir(defaultAppPath);
  await Promise.all(
    defaultFiles.map(async fileName => {
      await fs.copy(
        path.join(defaultAppPath, fileName),
        path.join(appPath, fileName),
      );
    }),
  );

  let gitIgnore = "";
  try {
    gitIgnore = await fs.readFile(gitIgnorePath, { encoding: "utf8" });
  } catch (e) {}
  gitIgnore += `\n.AvenDB.sqlite\n`;
  await fs.writeFile(gitIgnorePath, gitIgnore);

  console.log();
  console.log(
    `Setup complete! You can now run the following commands to start your new app:`,
  );
  console.log();
  console.log(chalk.cyan(`  cd ${pkg.name}`));
  console.log(chalk.cyan(`  yarn start`));
}

module.exports = runInit;
