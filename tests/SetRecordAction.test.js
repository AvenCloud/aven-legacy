const { initTestApp, setupTestUserSession } = require("./TestUtilities");

let app = null;

beforeEach(async () => {
  app = await initTestApp();
  await setupTestUserSession(app);
});

afterEach(async () => {
  await app.closeTest();
});

test("Set record works", async () => {
  await app.testDispatch({
    type: "SetRecordAction",
    authUser: app.testAuthUser,
    authSession: app.testAuthSession,
    recordID: "asdf",
    docID: null,
    permission: "PUBLIC",
  });

  const resultingRecord = await app.testDispatch({
    type: "GetRecordAction",
    authUser: app.testAuthUser,
    authSession: app.testAuthSession,
    recordID: "asdf",
  });

  expect(resultingRecord.canRead).toBe(true);
  expect(resultingRecord.canWrite).toBe(true);
  expect(resultingRecord.canAdmin).toBe(true);
  expect(resultingRecord.owner).toBe(app.testAuthUser);
});
