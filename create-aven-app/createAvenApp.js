const chalk = require("chalk");
const commander = require("commander");
const os = require("os");
const fs = require("fs-extra");
const createAppPackageJson = require("./package.json");
const validateProjectName = require("validate-npm-package-name");
const execSync = require("child_process").execSync;
const spawn = require("@expo/spawn-async");

const path = require("path");

let projectName;

const SCRIPTS_PACKAGE = "aven-scripts";

async function createAvenApp() {
  const program = new commander.Command(createAppPackageJson.name)
    .version(createAppPackageJson.version)
    .arguments("<project-directory>")
    .usage(`${chalk.green("<project-directory>")} [options]`)
    .action(name => {
      projectName = name;
    })
    .option("--verbose", "print additional logs")
    .allowUnknownOption()
    .on("--help", () => {
      console.log(
        `    Only ${chalk.green("<project-directory>")} is required.`,
      );
      console.log();
      console.log(
        `    If you have any problems, do not hesitate to file an issue:`,
      );
      console.log(
        `      ${chalk.cyan("https://github.com/AvenCloud/aven/issues/new")}`,
      );
      console.log();
    })
    .parse(process.argv);

  if (typeof projectName === "undefined") {
    console.error("Please specify the project directory:");
    console.log(
      `  ${chalk.cyan(program.name())} ${chalk.green("<project-directory>")}`,
    );
    console.log();
    console.log("For example:");
    console.log(
      `  ${chalk.cyan(program.name())} ${chalk.green("my-aven-app")}`,
    );
    console.log();
    console.log(
      `Run ${chalk.cyan(`${program.name()} --help`)} to see all options.`,
    );
    process.exit(1);
  }

  const root = path.resolve(projectName);
  const appName = path.basename(root);

  const validationResult = validateProjectName(appName);
  if (!validationResult.validForNewPackages) {
    console.error(
      `Could not create a project called ${chalk.red(
        `"${appName}"`,
      )} because of npm naming restrictions:`,
    );
    printValidationResults(validationResult.errors);
    printValidationResults(validationResult.warnings);
    process.exit(1);
  }

  if (appName === SCRIPTS_PACKAGE) {
    console.error(
      chalk.red(
        `We cannot create a project called ${chalk.green(
          SCRIPTS_PACKAGE,
        )} because you must depend on that package. \n\n`,
      ) + chalk.red("\n\nPlease choose a different project name."),
    );
    process.exit(1);
  }

  try {
    fs.mkdirSync(projectName);
  } catch (e) {
    console.error(
      chalk.red(
        `Cannot create a directory at ${chalk.green(
          root,
        )} because it already exists! \n\n`,
      ) +
        chalk.red(
          "\n\nPlease remove this directory or choose a different project name.",
        ),
    );
    process.exit(1);
  }

  const packageJson = {
    name: appName,
    version: "0.1.0",
  };
  fs.writeFileSync(
    path.join(root, "package.json"),
    JSON.stringify(packageJson, null, 2) + os.EOL,
  );

  console.log(`Installing ${chalk.cyan("aven-core")}...`);
  console.log();

  await spawn("yarnpkg", ["add", "-D", "aven-core"], {
    stdio: "inherit",
    cwd: root,
  });

  console.log("Initializing the app...");
  console.log();

  await spawn("yarnpkg", ["aven", "init"], {
    stdio: "inherit",
    cwd: root,
  });
}

createAvenApp()
  .then(() => {
    console.log("Done!");
  })
  .catch(e => {
    console.error("Err!", e);
  });
