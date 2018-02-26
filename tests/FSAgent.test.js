const { initTestApp, setupTestUserSession } = require("./TestUtilities");

let app = null;
let fsAgent = null;
const fs = require("fs-extra");
const { join } = require("path");
const FSAgent = require("../src/FSAgent");

beforeEach(async () => {
  app = await initTestApp();
  await setupTestUserSession(app);
  await fs.remove("__testDir");
  await fs.mkdir("__testDir");
  await fs.writeFile("__testDir/foo.txt", "foo");
  await fs.writeFile("__testDir/hello.txt", "good news, everybody!");
  await fs.mkdir("__testDir/foo");
  await fs.copy("graphics/favicon/favicon.prod.ico", "__testDir/favicon.ico");
  await fs.writeFile("__testDir/foo/goodnews.txt", "good news, foo!");
  fsAgent = await FSAgent({
    dispatch: app.testDispatch,
    authUser: app.testAuthUser,
    authSession: app.testAuthSession,
  });
});

afterEach(async () => {
  await app.closeTest();
  await fs.remove("__testDir");
});

test("checksumPath - Can checksum files", async () => {
  const sourceFile = join(__dirname, "../__testDir/foo.txt");
  const checksum = await fsAgent.checksumPath(sourceFile);
  expect(checksum).toBe("1125f1351964be6b17eab73caa92549911f0af9b");
});

test("checksumPath - Can checksum folder", async () => {
  const sourceFolder = join(__dirname, "../__testDir");
  const checksum = await fsAgent.checksumPath(sourceFolder);
  expect(checksum).toBe("26b21d8dfc2e97b6891483eac4cd9f8edcb27019");
});

test("putPath - Can put files", async () => {
  const sourceFile = join(__dirname, "../__testDir/foo.txt");
  const docID = await fsAgent.checksumPath(sourceFile);
  await app.testDispatch({
    authUser: app.testAuthUser,
    authSession: app.testAuthSession,
    type: "SetRecordAction",
    recordID: "fooFile",
    permission: "PUBLIC",
    doc: null,
    owner: app.testAuthUser,
  });
  const putResult = await fsAgent.putPath(sourceFile, "fooFile");
  expect(putResult.docID).toBe(docID);
});

test("putPath - Can put folder", async () => {
  const sourceFolder = join(__dirname, "../__testDir");
  const docID = await fsAgent.checksumPath(sourceFolder);
  await app.testDispatch({
    authUser: app.testAuthUser,
    authSession: app.testAuthSession,
    type: "SetRecordAction",
    recordID: "fooFolder",
    permission: "PUBLIC",
    docID: null,
    owner: app.testAuthUser,
  });
  const putResult = await fsAgent.putPath(sourceFolder, "fooFolder");
  expect(putResult.docID).toBe(docID);
});

test("uploadPath - Can upload folder", async () => {
  const sourceFolder = join(__dirname, "../__testDir");
  const docID = await fsAgent.checksumPath(sourceFolder);
  const uploadResult = await fsAgent.uploadPath(sourceFolder, "fooFolder");
  expect(uploadResult.docID).toBe(docID);
});

test("downloadPath - Can download folder after upload", async () => {
  const sourceFolder = join(__dirname, "../__testDir");
  const sourceChecksum = await fsAgent.checksumPath(sourceFolder);
  const uploadResult = await fsAgent.uploadPath(sourceFolder, "fooFolder");
  await fs.remove(sourceFolder);
  const downloadResult = await fsAgent.downloadPath(sourceFolder, "fooFolder");
  const downloadedChecksum = await fsAgent.checksumPath(sourceFolder);
  expect(downloadedChecksum).toBe(sourceChecksum);
});
