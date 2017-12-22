const fs = require("fs")
const { join, baseName } = require("path")
const { promisify } = require("bluebird")
const readDir = promisify(fs.readdir)
const readFile = promisify(fs.readFile)
const writeFile = promisify(fs.writeFile)
const lstat = promisify(fs.lstat)
const prettierVersion = require("../package.json").devDependencies.prettier

const projectRoot = join(__dirname, "..")
const topLevelDirs = ["src", "tests"]

const prettier = require("prettier")

async function enumerateDir(path) {
  const stat = await lstat(path)
  if (stat.isDirectory()) {
    const files = await readDir(path)
    const enumeratedFiles = await Promise.all(
      files.map(file => enumerateDir(join(path, file))),
    )
    return [].concat(...enumeratedFiles)
  } else {
    return path
  }
}

async function testJSFile(fileName, options) {
  const file = await readFile(fileName, { encoding: "utf8" })
  const formatted = prettier.format(file, options)
  const passed = formatted === file
  return {
    fileName,
    failureRaw: !passed && file,
    failureFormatted: !passed && formatted,
    passed: formatted === file,
  }
}

async function testJSFiles(files) {
  const options = await prettier.resolveConfig(projectRoot)
  console.log("Testing JS file format with prettier options: ", options)
  return Promise.all(files.map(file => testJSFile(file, options)))
}

async function runCodeCheck() {
  const dirEnumeration = await Promise.all(
    topLevelDirs.map(dir => enumerateDir(join(projectRoot, dir))),
  )
  const allFiles = [].concat(...dirEnumeration)
  const jsFiles = allFiles.filter(fileName => fileName.match(/\.js$/))
  const testResults = await testJSFiles(jsFiles)
  testResults.forEach(result => {
    const symbol = result.passed ? "✅" : "❌"
    console.log(`${symbol}  ${result.fileName}`)
  })
  if (testResults.find(result => !result.passed)) {
    console.error(
      "Code formatting check (prettier) failed!\n\n - Please run prettier on all js files, with the project .prettierrc settings. \n - Use prettier version " +
        prettierVersion +
        " \n - Use 2 spaces instead of tabs! \n\n",
    )
    await writeFile(
      join(projectRoot, "prettierCheck.debug"),
      JSON.stringify(testResults),
    )
    return 1
  } else {
    console.log("Code check passed!")
    return 0
  }
}

runCodeCheck().then(exitCode => process.exit(exitCode))
