const fs = require("fs-extra");
const path = require("path");
const inquirer = require("inquirer");

async function runInit() {
  const appPath = process.cwd();
  const defaultAppPath = path.join(__dirname, "../default-app");
  const gitIgnorePath = path.join(appPath, ".gitignore");
  const pkgJsonPath = path.join(appPath, "package.json");
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
  if (answers.mode !== "local") {
    throw "This mode is not yet supported";
  }
  pkg.main = "App.js";
  pkg.aven = {
    localDB: "./.AvenDB.sqlite",
  };
  pkg.scripts = {
    start: "aven start",
  };

  await fs.writeFile(pkgJsonPath, JSON.stringify(pkg, null, 2));

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
  await fs.readFile(gitIgnorePath, gitIgnore);
}

module.exports = runInit;
