jest.disableAutomock()

const { initTestApp, setupTestUserSession } = require("./TestUtilities")

let app = null

beforeEach(async () => {
  app = await initTestApp()
  await setupTestUserSession(app)
})

afterEach(async () => {
  await app.closeTest()
})

test("Create doc fails without a valid record", async () => {
  const createResult = await app.testDispatchError({
    type: "CreateDocAction",
    authUser: app.testAuthUser,
    authSession: app.testAuthSession,
    recordID: "asdf",
    value: { great: "document" },
  })
  expect(createResult.code).toBe("INVALID_RECORD")
})

test("Create doc works with owned record", async () => {
  const setRecordResult = await app.testDispatch({
    type: "SetRecordAction",
    authUser: app.testAuthUser,
    authSession: app.testAuthSession,
    id: "asdf",
    owner: app.testAuthUser,
    doc: null,
    permission: "PUBLIC",
  })
  const createResult = await app.testDispatch({
    type: "CreateDocAction",
    authUser: app.testAuthUser,
    authSession: app.testAuthSession,
    recordID: "asdf",
    value: { great: "document" },
  })
  const getResult = await app.testDispatch({
    type: "GetDocAction",
    authUser: app.testAuthUser,
    authSession: app.testAuthSession,
    docID: createResult.docID,
    recordID: "asdf",
  })

  expect(getResult.value.great).toBe("document")
})
