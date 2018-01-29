const fs = require("fs-extra")
const joinPath = require("path").join
const LocalClient = require("./LocalClient")

const ROOT_USER = "root"

const LOCAL_APP_PATH = joinPath(process.cwd(), "app")

async function start(app) {
  const contextFilePath = joinPath(process.cwd(), ".AvenContext.json")
  let lastContext = {}
  if (await fs.exists(contextFilePath)) {
    const contextData = await fs.readFile(contextFilePath, { encoding: "utf8" })
    lastContext = JSON.parse(contextData)
  }
  const context = { ...lastContext }
  if (!context.authUser) {
    context.authUser = ROOT_USER
    await app.dispatch.AuthRegisterAction({
      id: ROOT_USER,
      email: "test@example.com",
      displayName: "Test User",
      password: "test",
    })
    const { authCode } = app.infra.email._testSentEmails[0].meta
    const verifyResult = await app.dispatch.AuthVerifyAction({
      id: "test@example.com",
      code: authCode,
      user: ROOT_USER,
    })
    const loginResult = await app.dispatch.AuthLoginAction({
      user: ROOT_USER,
      password: "test",
    })
    if (!loginResult || !loginResult.session) {
      throw "Could not log in root user!"
    }
    context.authSession = loginResult.session
    await fs.writeFile(contextFilePath, JSON.stringify(context))
  }
  const { authUser, authSession } = context
  const fsClient = await LocalClient({
    dispatch: app.dispatch,
    authUser,
    authSession,
  })

  const uploadRes = await fsClient.uploadPath(LOCAL_APP_PATH, "App")

  console.log("INIT UPLOAD!", uploadRes)

  const localStart = await fsClient.startLocal(LOCAL_APP_PATH, "App")
  console.log("INIT LOCAL!", localStart)
  async function close() {
    fsClient.close()
  }

  return close
}

module.exports = {
  start,
}
