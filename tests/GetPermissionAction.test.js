const { initTestApp, setupTestUserSession } = require("./TestUtilities");

let app = null;

const testAuthUser = "jane";
let testAuthSession = null;

beforeEach(async () => {
  app = await initTestApp();
  await setupTestUserSession(app);

  const reg = await app.testDispatch({
    type: "AuthRegisterAction",
    displayName: "Root Monkey",
    userID: testAuthUser,
    password: "foobar",
    email: "foo2@bar.com",
  });
  const emailContent = app.infra.email._testSentEmails[1].content;
  const codeMatches = emailContent.match(/code=([a-zA-Z0-9]*)/);
  const verificationCode = codeMatches && codeMatches[1];
  await app.testDispatch({
    type: "AuthVerifyAction",
    code: verificationCode,
    authID: reg.authID,
    userID: testAuthUser,
  });
  const loginResult = await app.testDispatch({
    type: "AuthLoginAction",
    userID: testAuthUser,
    password: "foobar",
  });
  testAuthSession = loginResult.session;
});

afterEach(async () => {
  await app.closeTest();
});

test.skip("Permissions are granted for root user", async () => {
  const rootPermission = await app.testDispatch({
    type: "GetPermissionAction",
    authUser: app.testAuthUser,
    authSession: app.testAuthSession,
    recordID: "",
  });
  expect(app.testAuthUser).toEqual("root");
  expect(rootPermission.recordID).toEqual("");
  expect(rootPermission.canAdmin).toEqual(true);
  expect(rootPermission.canExecute).toEqual(true);
  expect(rootPermission.canRead).toEqual(true);
  expect(rootPermission.canWrite).toEqual(true);
  const permission = await app.testDispatch({
    type: "GetPermissionAction",
    authUser: app.testAuthUser,
    authSession: app.testAuthSession,
    recordID: "foo",
  });
  expect(permission.recordID).toEqual("foo");
  expect(permission.canAdmin).toEqual(true);
  expect(permission.canExecute).toEqual(true);
  expect(permission.canRead).toEqual(true);
  expect(permission.canWrite).toEqual(true);
});

test.skip("Permissions are not granted for non-root user", async () => {
  const rootPermission = await app.testDispatch({
    type: "GetPermissionAction",
    authUser: testAuthUser,
    authSession: testAuthSession,
    recordID: "",
  });
  expect(testAuthUser).not.toEqual("root");
  expect(rootPermission.recordID).toEqual("");
  expect(rootPermission.canAdmin).toEqual(false);
  expect(rootPermission.canExecute).toEqual(false);
  expect(rootPermission.canRead).toEqual(false);
  expect(rootPermission.canWrite).toEqual(false);
  const permission = await app.testDispatch({
    type: "GetPermissionAction",
    authUser: testAuthUser,
    authSession: testAuthSession,
    recordID: "foo",
  });
  expect(permission.recordID).toEqual("foo");
  expect(permission.canAdmin).toEqual(false);
  expect(permission.canExecute).toEqual(false);
  expect(permission.canRead).toEqual(false);
  expect(permission.canWrite).toEqual(false);
});

test.skip("user namespace permissions are granted by default unless real record exists", async () => {
  const userNamespaceRecord = `@${testAuthUser}`;
  const defaultPermission = await app.testDispatch({
    type: "GetPermissionAction",
    authUser: testAuthUser,
    authSession: testAuthSession,
    recordID: userNamespaceRecord,
  });
  expect(testAuthUser).not.toEqual("root");
  expect(defaultPermission.recordID).toEqual(userNamespaceRecord);
  expect(defaultPermission.canAdmin).toEqual(true);
  expect(defaultPermission.canExecute).toEqual(true);
  expect(defaultPermission.canRead).toEqual(true);
  expect(defaultPermission.canWrite).toEqual(true);

  await app.testDispatch({
    type: "SetRecordAction",
    authUser: app.testAuthUser, // this is root
    authSession: app.testAuthSession,
    recordID: userNamespaceRecord,
    docID: null,
    owner: app.testAuthUser,
    permission: "PRIVATE",
  });
  const permission = await app.testDispatch({
    type: "GetPermissionAction",
    authUser: testAuthUser,
    authSession: testAuthSession,
    recordID: userNamespaceRecord,
  });
  expect(permission.canAdmin).toEqual(false);
  expect(permission.canExecute).toEqual(false);
  expect(permission.canRead).toEqual(false);
  expect(permission.canWrite).toEqual(false);
});

test.skip("records can be set to public", async () => {
  await app.testDispatch({
    type: "SetRecordAction",
    authUser: app.testAuthUser, // this is root
    authSession: app.testAuthSession,
    recordID: "Foo",
    docID: null,
    owner: app.testAuthUser,
    permission: "PUBLIC",
  });
  const permission = await app.testDispatch({
    type: "GetPermissionAction",
    recordID: "Foo",
  });
  expect(permission.canAdmin).toEqual(false);
  expect(permission.canExecute).toEqual(false);
  expect(permission.canRead).toEqual(true);
  expect(permission.canWrite).toEqual(false);
});
