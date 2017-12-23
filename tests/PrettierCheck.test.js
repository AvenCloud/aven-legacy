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
  // expect file to be formatted (lol!)
  expect(file).toBe(formatted)
}

test("JS file format with project prettier options", async () => {
  const dirEnumeration = await Promise.all(
    topLevelDirs.map(dir => enumerateDir(join(projectRoot, dir))),
  )
  const allFiles = [].concat(...dirEnumeration)
  const jsFiles = allFiles.filter(fileName => fileName.match(/\.js$/))
  const options = await prettier.resolveConfig(projectRoot)
  await Promise.all(jsFiles.map(file => testJSFile(file, options)))
})
