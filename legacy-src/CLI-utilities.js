const fetch = require("node-fetch");
const fileType = require("file-type");
const cookie = require("cookie");
const denodeify = require("denodeify");
const fs = require("fs");

const fsMkdir = denodeify(fs.mkdir);
const fsReaddir = denodeify(fs.readdir);
const fsWriteFile = denodeify(fs.writeFile);
const fsLstat = denodeify(fs.lstat);
const fsReadFile = denodeify(fs.readFile);

const join = require("path").join;

const dispatch = async(action, auth) => {
  const cookies = auth.username &&
    auth.session && {
      user: auth.username,
      session: auth.session
    };
  const cookieHeader =
    cookies &&
    Object.keys(cookies)
    .map(c => cookie.serialize(c, cookies[c]))
    .join("; ");

  const result = await fetch(auth.server + "/api/dispatch", {
    method: "POST",
    body: JSON.stringify(action),
    headers: {
      "Content-Type": "application/json",
      Cookie: cookieHeader
    }
  });
  if (result.status !== 200) {
    throw await result.text();
  }
  let resultData = await result.buffer();
  const binaryType = fileType(resultData);
  try {
    if (!binaryType) {
      resultData = resultData.toString("utf8");
    }
  } catch (e) {}
  try {
    const resultJSON = JSON.parse(resultData);
    return resultJSON;
  } catch (e) {
    return resultData;
  }
};

const downloadFile = async(auth, projectUser, projectName, id, destPath) => {
  console.log(`Downloading ${id} to ${destPath}`);
  let stat = null;
  if (await fsExists(destPath)) {
    stat = await fsLstat(destPath);
  }
  let doc = null;
  try {
    doc = await dispatch({
        type: "GetDocAction",
        user: projectUser,
        project: projectName,
        id
      },
      auth
    );
  } catch (e) {
    console.error("woah there buddy", e);
  }
  if (doc.type === "Folder") {
    if (!await fsExists(destPath)) {
      await fsMkdir(destPath);
    } else if (!stat.isDirectory()) {
      throw `${destPath} already exists and it is not a folder!`;
    }

    const fileNames = Object.keys(doc.files);
    await Promise.all(
      fileNames.map(async fileName => {
        const file = doc.files[fileName];
        return await downloadFile(
          auth,
          projectUser,
          projectName,
          file.value,
          `${destPath}/${fileName}`
        );
      })
    );
    return;
  }

  await fsWriteFile(destPath, doc);
};

const download = async(auth, path) => {
  const project = await dispatch({
      type: "GetRecordAction",
      user: auth.projectUser,
      project: auth.projectName
    },
    auth
  );

  if (!project || !project.rootDoc) {
    throw "Cannot get project or its root doc!";
  }

  await downloadFile(
    auth,
    auth.projectUser,
    auth.projectName,
    project.rootDoc,
    path
  );
};

const babel = require("babel-core");
const presetEs2015 = require("babel-preset-es2015");
const presetStage0 = require("babel-preset-stage-0");
const presetReact = require("babel-preset-react");

async function putFileObject(auth, path) {
  let fileData = await fsReadFile(path, {
    encoding: "utf8"
  }); // uh no bin support yet

  const uploadResult = await dispatch({
      type: "CreateDocAction",
      project: auth.projectName,
      user: auth.projectUser,
      data: fileData
    },
    auth
  );
  return uploadResult.docId;
}

async function putJSModule(auth, sourcePath) {
  const source = await fsReadFile(sourcePath, {
    encoding: "utf8"
  });
  let dependencies = null;
  const parsedBabel = babel.transform(source, {
    sourceMaps: true,
    presets: [presetEs2015, presetStage0, presetReact],
    plugins: [
      ({
        parse,
        traverse
      }) => ({
        visitor: {
          ArrowFunctionExpression(path) {
            if (!dependencies) {
              const input = path.node.params[0];
              dependencies = input.properties.map(a => {
                return a.value.name;
              });
            }
          }
        }
      })
    ]
  });
  const moduleData = JSON.stringify({
    dependencies,
    type: "JSModule",
    code: parsedBabel.code,
    map: parsedBabel.map,
    source
  });
  const uploadResult = await dispatch({
      type: "CreateDocAction",
      project: auth.projectName,
      user: auth.projectUser,
      data: moduleData
    },
    auth
  );
  return uploadResult.docId;
}

async function putPathObject(auth, path) {
  const stat = await fsLstat(path);
  if (stat.isDirectory()) {
    return putFolderObject(auth, path);
  } else {
    return putFileObject(auth, path);
  }
}

async function putFolderObject(auth, path) {
  const items = await fsReaddir(path);
  const uploadableFiles = items.filter(item => item !== ".avenconfig");
  const allIDs = await Promise.all(
    uploadableFiles.map(fileName => putPathObject(auth, join(path, fileName)))
  );
  const files = {};
  await Promise.all(
    uploadableFiles.map(async(fileName, index) => {
      files[fileName] = {
        name: fileName,
        value: allIDs[index]
      };
      if (fileName.match(/.js$/)) {
        const sourcePath = join(path, fileName);
        const compiledFile = await putJSModule(auth, sourcePath);
        const destFileName = fileName + ".jsmodule";
        files[destFileName] = {
          name: destFileName,
          value: compiledFile
        };
      }
    })
  );
  const uploadResult = await dispatch({
      type: "CreateDocAction",
      project: auth.projectName,
      user: auth.projectUser,
      data: JSON.stringify({
        type: "Folder",
        files
      })
    },
    auth
  );
  return uploadResult.docId;
}

async function upload(auth, path) {
  if (auth.projectUser !== auth.username) {
    throw "Cannot upload a project that is not yours";
  }
  const rootDoc = await putFolderObject(auth, path);
  const uploadResult = await dispatch({
      type: "SetRecordAction",
      projectName: auth.projectName,
      rootDoc
    },
    auth
  );

  console.log("uploading..", uploadResult);
}

function fsExists(dir) {
  return new Promise((resolve, reject) =>
    fs.exists(dir, doesExist => resolve(doesExist))
  );
}

module.exports = {
  dispatch,
  downloadFile,
  download,
  upload,
  fsExists,
  fsWriteFile,
  fsReadFile,
  fsMkdir,
  fsLstat,
  fsReaddir
};