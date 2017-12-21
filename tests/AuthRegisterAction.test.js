jest.disableAutomock();

const App = require("../src/App");
const request = require("supertest");
const Infra = require('../src/Infra');

let app = null;

beforeEach(async () => {
  const infra = await Infra({ port: 6997, env: 'testing' });
  app = await App(infra);
});

afterEach(async () => {
  await app.model.user.truncate({ cascade: true });
  await app.close();
});

const dispatch = async action => {
  const result = await request(app)
    .post("/api/dispatch")
    .send(action)
    .set("Accept", "application/json")
    .expect(200);
  return result.body;
};

const dispatchError = async action => {
  const result = await request(app)
    .post("/api/dispatch")
    .send(action)
    .set("Accept", "application/json")
    .expect(400);
  return result.body;
};


test("Duplicate username handling", async () => {
  await dispatch({
    type: "AuthRegisterAction",
    displayName: "Foo Bar",
    id: "foo",
    password: "foobar",
    email: "foo1@bar.com"
  });
  const result = await dispatchError({
    type: "AuthRegisterAction",
    displayName: "Foo Bar",
    id: "foo",
    password: "foobar",
    email: "foo2@bar.com"
  });
  expect(result.code).toBe('EXISTING_USERNAME');
});

test("Duplicate email prevention", async () => {
  await dispatch({
    type: "AuthRegisterAction",
    displayName: "Foo Bar",
    id: "foo",
    password: "foobar",
    email: "foo@bar.com"
  });
  const result = await dispatchError({
    type: "AuthRegisterAction",
    displayName: "Foo Bar",
    id: "bar",
    password: "foobar",
    email: "foo@bar.com"
  });
  expect(result.code).toBe('EXISTING_EMAIL');
});

test("Email verification works", async () => {
  const userID = 'lucy';
  const email = `${userID}@bar.com`;
  const registration = await dispatch({
    type: "AuthRegisterAction",
    displayName: "Foo Bar",
    id: userID,
    password: "foobar",
    email
  });
  expect(app.infra.email._testSentEmails.length).toBe(1);
  expect(app.infra.email._testSentEmails[0].to).toBe(email);
  const emailContent = app.infra.email._testSentEmails[0].content;
  const codeMatches = emailContent.match(/code=([a-zA-Z0-9]*)/);
  const verificationCode = codeMatches && codeMatches[1];

  await dispatch({
    type: 'AuthVerifyAction',
    code: verificationCode,
    id: registration.authID,
    user: userID
  })
});
