const request = require("supertest")

const App = require("../src/App")
const Infra = require("../src/Infra")

async function initTestApp() {
  const infra = await Infra({ port: 6995, env: "testing" })
  const app = await App(infra)

  app.testDispatch = async action => {
    const result = await request(app)
      .post("/api/dispatch")
      .send(action)
      .set("Accept", "application/json")
      .expect(200)
    return result.body
  }

  app.testDispatchError = async action => {
    const result = await request(app)
      .post("/api/dispatch")
      .send(action)
      .set("x-aven-test", "expect-error")
      .set("Accept", "application/json")
      .expect(400)
    return result.body
  }

  app.closeTest = async () => {
    await app.model.user.truncate({ cascade: true })
    await app.close()
  }

  return app
}

async function setupTestUserSession(app) {
  app.testAuthUser = "monkey"
  const reg = await app.testDispatch({
    type: "AuthRegisterAction",
    displayName: "Foo Monkey",
    id: app.testAuthUser,
    password: "foobar",
    email: "foo1@bar.com",
  })
  const emailContent = app.infra.email._testSentEmails[0].content
  const codeMatches = emailContent.match(/code=([a-zA-Z0-9]*)/)
  const verificationCode = codeMatches && codeMatches[1]
  await app.testDispatch({
    type: "AuthVerifyAction",
    code: verificationCode,
    id: reg.authID,
    user: app.testAuthUser,
  })
  const loginResult = await app.testDispatch({
    type: "AuthLoginAction",
    user: app.testAuthUser,
    password: "foobar",
  })
  app.testAuthSession = loginResult.session
}

module.exports = {
  initTestApp,
  setupTestUserSession,
  registerAndLoginTestUser: async () => {},
}
