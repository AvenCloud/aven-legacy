const { initTestApp } = require("./TestUtilities")

let app = null

beforeEach(async () => {
  app = await initTestApp()
})

afterEach(async () => {
  await app.closeTest()
})

test("Logout works with session token", async () => {
  const userID = "foo"
  const reg = await app.testDispatch({
    type: "AuthRegisterAction",
    displayName: "Foo Bar",
    id: userID,
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
    user: userID,
  })

  const loginResult = await app.testDispatch({
    type: "AuthLoginAction",
    user: userID,
    password: "foobar",
  })
  const sessionToken = loginResult.session

  const logoutResult = await app.testDispatch({
    type: "AuthLogoutAction",
    session: sessionToken,
  })
})

test("Logout works with logout token", async () => {
  const userID = "foo"
  const reg = await app.testDispatch({
    type: "AuthRegisterAction",
    displayName: "Foo Bar",
    id: userID,
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
    user: userID,
  })

  const loginResult = await app.testDispatch({
    type: "AuthLoginAction",
    user: userID,
    password: "foobar",
  })
  const logoutToken = loginResult.logoutToken

  const logoutResult = await app.testDispatch({
    type: "AuthLogoutAction",
    session: logoutToken,
  })
})
