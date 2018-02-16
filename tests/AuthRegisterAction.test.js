const { initTestApp } = require("./TestUtilities");

let app = null;

beforeEach(async () => {
  app = await initTestApp();
});

afterEach(async () => {
  await app.closeTest();
});

test("Duplicate username handling", async () => {
  await app.testDispatch({
    type: "AuthRegisterAction",
    displayName: "Foo Bar",
    userID: "foo",
    password: "foobar",
    email: "foo1@bar.com",
  });
  const result = await app.testDispatchError({
    type: "AuthRegisterAction",
    displayName: "Foo Bar",
    userID: "foo",
    password: "foobar",
    email: "foo2@bar.com",
  });
  expect(result.code).toBe("EXISTING_USERNAME");
});

test("Duplicate email prevention", async () => {
  await app.testDispatch({
    type: "AuthRegisterAction",
    displayName: "Foo Bar",
    userID: "foo",
    password: "foobar",
    email: "foo@bar.com",
  });
  const result = await app.testDispatchError({
    type: "AuthRegisterAction",
    displayName: "Foo Bar",
    userID: "bar",
    password: "foobar",
    email: "foo@bar.com",
  });
  expect(result.code).toBe("EXISTING_EMAIL");
});

test("Email verification works", async () => {
  const userID = "lucy";
  const email = `${userID}@bar.com`;
  const reg = await app.testDispatch({
    type: "AuthRegisterAction",
    displayName: "Foo Bar",
    userID,
    password: "foobar",
    email,
  });
  expect(app.infra.email._testSentEmails.length).toBe(1);
  expect(app.infra.email._testSentEmails[0].to).toBe(email);
  const emailContent = app.infra.email._testSentEmails[0].content;
  const codeMatches = emailContent.match(/code=([a-zA-Z0-9]*)/);
  const verificationCode = codeMatches && codeMatches[1];

  await app.testDispatch({
    type: "AuthVerifyAction",
    code: verificationCode,
    authID: reg.authID,
    userID,
  });
});
