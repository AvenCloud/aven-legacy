const { initTestApp } = require("./TestUtilities");

let app = null;

beforeEach(async () => {
  app = await initTestApp();
});

afterEach(async () => {
  await app.closeTest();
});

test("Login doesn't work without verification", async () => {
  await app.testDispatch({
    type: "AuthRegisterAction",
    displayName: "Foo Bar",
    userID: "foo",
    password: "foobar",
    email: "foo1@bar.com",
  });
  const result = await app.testDispatchError({
    type: "AuthLoginAction",
    userID: "foo",
    password: "foobar",
  });
  expect(result.code).toBe("INVALID_ACCOUNT_VERIFICATION");
});

test("Login works", async () => {
  const userID = "foo";
  const reg = await app.testDispatch({
    type: "AuthRegisterAction",
    displayName: "Foo Bar",
    userID,
    password: "foobar",
    email: "foo1@bar.com",
  });

  const emailContent = app.infra.email._testSentEmails[0].content;
  const codeMatches = emailContent.match(/code=([a-zA-Z0-9]*)/);
  const verificationCode = codeMatches && codeMatches[1];

  await app.testDispatch({
    type: "AuthVerifyAction",
    code: verificationCode,
    authID: reg.authID,
    userID,
  });
  const loginResult = await app.testDispatch({
    type: "AuthLoginAction",
    userID,
    password: "foobar",
  });
  expect(loginResult.userID).toBe(userID);
});

test("Bad secret fails", async () => {
  const invalidUserLoginResult = await app.testDispatchError({
    type: "AuthLoginAction",
    user: "rando",
    password: "fail",
  });
  expect(invalidUserLoginResult.code).toBe("INVALID_LOGIN");
  const userID = "foo";
  const reg = await app.testDispatch({
    type: "AuthRegisterAction",
    displayName: "Foo Bar",
    userID,
    password: "foobar",
    email: "foo1@bar.com",
  });

  const emailContent = app.infra.email._testSentEmails[0].content;
  const codeMatches = emailContent.match(/code=([a-zA-Z0-9]*)/);
  const verificationCode = codeMatches && codeMatches[1];

  await app.testDispatch({
    type: "AuthVerifyAction",
    code: verificationCode,
    authID: reg.authID,
    userID,
  });

  const loginResult = await app.testDispatchError({
    type: "AuthLoginAction",
    userID: "foo",
    password: "fail",
  });
  expect(loginResult.code).toBe("INVALID_LOGIN");
});
