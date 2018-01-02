const { initTestApp, setupTestUserSession } = require("./TestUtilities")

let app = null
let client = null
const fs = require("fs-extra")
const sleep = require("sleep-promise")
const { join } = require("path")
const LocalClient = require("../src/LocalClient")

beforeEach(async () => {
  app = await initTestApp()
  await setupTestUserSession(app)
  await fs.remove("__testDir")
  await fs.mkdir("__testDir")
  await fs.writeFile("__testDir/foo.txt", "foo")
  await fs.writeFile("__testDir/hello.txt", "good news, everybody!")
  await fs.mkdir("__testDir/foo")
  await fs.copy("graphics/favicon/favicon.prod.ico", "__testDir/favicon.ico")
  await fs.writeFile("__testDir/foo/goodnews.txt", "good news, foo!")
  client = await LocalClient({
    dispatch: app.testDispatch,
    authUser: app.testAuthUser,
    authSession: app.testAuthSession,
  })
})

afterEach(async () => {
  await app.closeTest()
  await client.close()
  await fs.remove("__testDir")
  await fs.remove("__testTestDir")
})

test(
  "startLocal - Can upload folder and watch changes",
  async () => {
    const sourceFolder = join(__dirname, "../__testDir")
    const testFolder = join(__dirname, "../__testTestDir")
    const sourceChecksum = await client.checksumPath(sourceFolder)
    console.log("startLocal", sourceFolder)
    await client.startLocal(sourceFolder, "fooFolder")
    console.log("downloadPath")
    await client.downloadPath(testFolder, "fooFolder")
    const downloadedChecksum = await client.checksumPath(testFolder)
    console.log("downloadedChecksum", downloadedChecksum)
    expect(downloadedChecksum).toBe(sourceChecksum)
    await fs.writeFile("__testDir/foo.txt", "bar")
    await fs.writeFile("__testDir/foo/goodnews.txt", "gooder news!")
    console.log("wrrote new files!")
    const sourceChecksum2 = await client.checksumPath(sourceFolder)
    console.log("sourceChecksum2!", sourceChecksum2)
    await fs.remove(testFolder)
    console.log("fs.remove(testFolder)!")
    await client.downloadPath(testFolder, "fooFolder")
    console.log("client.downloadPath(testFolder")
    await sleep(2000)
    console.log("sleep 2")
    const downloadedChecksum2 = await client.checksumPath(testFolder)
    console.log("downloadedChecksum2, ", downloadedChecksum2, sourceChecksum2)
    expect(downloadedChecksum2).toBe(sourceChecksum2)
  },
  12000,
)
