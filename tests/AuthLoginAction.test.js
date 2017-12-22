jest.disableAutomock()

const App = require("../src/App")
const request = require("supertest")
const Infra = require("../src/Infra")

let app = null

beforeEach(async () => {
  const infra = await Infra({ port: 6997, env: "testing" })
  app = await App(infra)
})

afterEach(async () => {
  await app.model.user.truncate({ cascade: true })
  await app.close()
})

const dispatch = async action => {
  const result = await request(app)
    .post("/api/dispatch")
    .send(action)
    .set("Accept", "application/json")
    .expect(200)
  return result.body
}

const dispatchError = async action => {
  const result = await request(app)
    .post("/api/dispatch")
    .send(action)
    .set("Accept", "application/json")
    .expect(400)
  return result.body
}

test("Login doesn't work without verification", async () => {
  await dispatch({
    type: "AuthRegisterAction",
    displayName: "Foo Bar",
    id: "foo",
    password: "foobar",
    email: "foo1@bar.com",
  })
  const result = await dispatchError({
    type: "AuthLoginAction",
    user: "foo",
    password: "foobar",
  })
  expect(result.code).toBe("INVALID_ACCOUNT_VERIFICATION")
})

test("Login works", async () => {
  const userID = "foo"
  const reg = await dispatch({
    type: "AuthRegisterAction",
    displayName: "Foo Bar",
    id: userID,
    password: "foobar",
    email: "foo1@bar.com",
  })

  const emailContent = app.infra.email._testSentEmails[0].content
  const codeMatches = emailContent.match(/code=([a-zA-Z0-9]*)/)
  const verificationCode = codeMatches && codeMatches[1]

  await dispatch({
    type: "AuthVerifyAction",
    code: verificationCode,
    id: reg.authID,
    user: userID,
  })
  const loginResult = await dispatch({
    type: "AuthLoginAction",
    user: userID,
    password: "foobar",
  })
})

test("Bad secret fails", async () => {
  const invalidUserLoginResult = await dispatchError({
    type: "AuthLoginAction",
    user: "rando",
    password: "fail",
  })
  expect(invalidUserLoginResult.code).toBe("INVALID_LOGIN")
  const userID = "foo"
  const reg = await dispatch({
    type: "AuthRegisterAction",
    displayName: "Foo Bar",
    id: userID,
    password: "foobar",
    email: "foo1@bar.com",
  })

  const emailContent = app.infra.email._testSentEmails[0].content
  const codeMatches = emailContent.match(/code=([a-zA-Z0-9]*)/)
  const verificationCode = codeMatches && codeMatches[1]

  await dispatch({
    type: "AuthVerifyAction",
    code: verificationCode,
    id: reg.authID,
    user: userID,
  })

  const loginResult = await dispatchError({
    type: "AuthLoginAction",
    user: "foo",
    password: "fail",
  })
  expect(loginResult.code).toBe("INVALID_LOGIN")
})
