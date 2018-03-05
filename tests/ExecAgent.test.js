const { initTestApp, setupTestUserSession } = require("./TestUtilities");

let app = null;
let execAgent = null;
let setFooValue = async () => {};
const fs = require("fs-extra");
const { join } = require("path");
const ExecAgent = require("../src/ExecAgent");
const ClientAuthAgent = require("../src/ClientAuthAgent");

beforeEach(async () => {
  app = await initTestApp();
  await setupTestUserSession(app);
  const clientAgent = ClientAuthAgent({
    dispatch: app.testDispatch,
  });
  clientAgent.setSession(app.testAuthUser, app.testAuthSession);

  await clientAgent.dispatch({
    type: "SetRecordAction",
    recordID: "Test",
    permission: "PUBLIC",
    docID: null,
    owner: app.testAuthUser,
  });

  const FooSquared = await clientAgent.dispatch({
    type: "CreateDocAction",
    recordID: "Test",
    value: {
      type: "JSModule",
      code: "({Foo}) => Foo * Foo",
      dependencies: ["Foo"],
    },
  });

  setFooValue = async val => {
    const Foo = await clientAgent.dispatch({
      type: "CreateDocAction",
      recordID: "Test",
      value: val,
    });

    const TestFolder = await clientAgent.dispatch({
      type: "CreateDocAction",
      recordID: "Test",
      value: {
        type: "Directory",
        files: [
          { fileName: "Foo.json", docID: Foo.docID },
          { fileName: "FooSquared.js", docID: FooSquared.docID },
        ],
      },
    });

    await clientAgent.dispatch({
      type: "SetRecordAction",
      recordID: "Test",
      permission: "PUBLIC",
      docID: TestFolder.docID,
      owner: app.testAuthUser,
    });
  };

  await setFooValue(4);

  execAgent = await ExecAgent(clientAgent);
});

afterEach(async () => {
  await app.closeTest();
  await fs.remove("__testDir");
});

test("basic exec", async () => {
  const execResult = await execAgent.exec("Test", "FooSquared");
  expect(execResult).toBe(16);
  await setFooValue(5);
  const exec2Result = await execAgent.exec("Test", "FooSquared");
  expect(exec2Result).toBe(25);
});
