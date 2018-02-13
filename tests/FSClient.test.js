const { initTestApp, setupTestUserSession } = require("./TestUtilities");

let app = null;
let client = null;
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
  client = await FSAgent({
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
  const checksum = await client.checksumPath(sourceFile);
  expect(checksum).toBe("ce7929f1bee232db4c73542c06ed42ee7a5e0679");
});

test("checksumPath - Can checksum folder", async () => {
  const sourceFolder = join(__dirname, "../__testDir");
  const checksum = await client.checksumPath(sourceFolder);
  expect(checksum).toBe("05927cead7e923a2269a4fe674f980704bc6a6e9");
});

test("putPath - Can put files", async () => {
  const sourceFile = join(__dirname, "../__testDir/foo.txt");
  const docID = await client.checksumPath(sourceFile);
  await app.testDispatch({
    authUser: app.testAuthUser,
    authSession: app.testAuthSession,
    type: "SetRecordAction",
    recordID: "fooFile",
    permission: "PUBLIC",
    doc: null,
    owner: app.testAuthUser,
  });
  const putResult = await client.putPath(sourceFile, "fooFile");
  expect(putResult.docID).toBe(docID);
});

test("putPath - Can put folder", async () => {
  const sourceFolder = join(__dirname, "../__testDir");
  const docID = await client.checksumPath(sourceFolder);
  await app.testDispatch({
    authUser: app.testAuthUser,
    authSession: app.testAuthSession,
    type: "SetRecordAction",
    recordID: "fooFolder",
    permission: "PUBLIC",
    docID: null,
    owner: app.testAuthUser,
  });
  const putResult = await client.putPath(sourceFolder, "fooFolder");
  expect(putResult.docID).toBe(docID);
});

test("uploadPath - Can upload folder", async () => {
  const sourceFolder = join(__dirname, "../__testDir");
  const docID = await client.checksumPath(sourceFolder);
  const uploadResult = await client.uploadPath(sourceFolder, "fooFolder");
  expect(uploadResult.docID).toBe(docID);
});

test("downloadPath - Can download folder after upload", async () => {
  const sourceFolder = join(__dirname, "../__testDir");
  const sourceChecksum = await client.checksumPath(sourceFolder);
  const uploadResult = await client.uploadPath(sourceFolder, "fooFolder");
  await fs.remove(sourceFolder);
  const downloadResult = await client.downloadPath(sourceFolder, "fooFolder");
  const downloadedChecksum = await client.checksumPath(sourceFolder);
  expect(downloadedChecksum).toBe(sourceChecksum);
});
