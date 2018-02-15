const fs = require("fs-extra");
const chalk = require("chalk");
const path = require("path");
const inquirer = require("inquirer");

const DB_TEMPLATE = path.join(__dirname, "../AvenDBTemplate.sqlite");

async function runInit() {
  const appPath = process.cwd();
  const defaultAppPath = path.join(__dirname, "../app");
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
  pkg.scripts = {
    start: "aven start",
  };

  await fs.copy(DB_TEMPLATE, "./.AvenDB.sqlite");

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
