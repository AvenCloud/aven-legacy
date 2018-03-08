const request = require("supertest");

const Server = require("../src/Server");

async function initTestApp() {
  const { closeServer, app } = await Server({});

  app.testDispatch = async action => {
    const result = await request(app)
      .post("/api/dispatch")
      .send(action)
      .set("Accept", "application/json")
      .expect(200);
    return result.body;
  };

  app.testDispatchError = async action => {
    const result = await request(app)
      .post("/api/dispatch")
      .send(action)
      .set("x-aven-test", "expect-error")
      .set("Accept", "application/json")
      .expect(400);
    return result.body;
  };

  app.closeTest = async () => {
    await app.infra.model.user.truncate({ cascade: true });
    await closeServer();
  };

  return app;
}

async function setupTestUserSession(app) {
  app.testAuthUser = "root";
  const reg = await app.testDispatch({
    type: "AuthRegisterAction",
    displayName: "Root Monkey",
    userID: app.testAuthUser,
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
    userID: app.testAuthUser,
  });
  const loginResult = await app.testDispatch({
    type: "AuthLoginAction",
    userID: app.testAuthUser,
    password: "foobar",
  });
  app.testAuthSession = loginResult.session;
}

module.exports = {
  initTestApp,
  setupTestUserSession,
};
