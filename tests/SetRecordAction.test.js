jest.disableAutomock()

const App = require("../src/App")
const request = require("supertest")
const Infra = require("../src/Infra")

let app = null
const authUser = "foo"
let authSession = null

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

beforeEach(async () => {
  const infra = await Infra({ port: 6997, env: "testing" })
  app = await App(infra)

  const reg = await dispatch({
    type: "AuthRegisterAction",
    displayName: "Foo Bar",
    id: authUser,
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
    user: authUser,
  })

  const loginResult = await dispatch({
    type: "AuthLoginAction",
    user: authUser,
    password: "foobar",
  })
  authSession = loginResult.session
})

afterEach(async () => {
  await app.model.user.truncate({ cascade: true })
  await app.close()
})

test("Set record works", async () => {
  await dispatch({
    type: "SetRecordAction",
    authUser,
    authSession,
    id: "asdf",
    owner: authUser,
    doc: null,
    permission: "PUBLIC",
  })

  const resultingRecord = await dispatch({
    type: "GetRecordAction",
    authUser,
    authSession,
    id: "asdf",
  })

  expect(resultingRecord.permission).toBe("PUBLIC")
  expect(resultingRecord.owner).toBe("foo")
})
