const fetch = require("node-fetch");
const fileType = require("file-type");
const { promisify } = require("bluebird");
const fs = require("fs-extra");
const stringify = require("json-stable-stringify");
const { join, basename } = require("path");
const { digest } = require("./Utilities");

const isBinaryFile = promisify(require("isbinaryfile"));

const EMBARASSING_HACK_BAN_FILE_NAMES = ["node_modules", "Directory.json"];

// babel stufs:
const babel = require("babel-core");
const presetStage0 = require("babel-preset-stage-0");
const presetReact = require("babel-preset-react");

async function FSAgent(agent) {
  const { dispatch, authUser, authSession } = agent;
  const uploadedFiles = agent.uploadedFiles || (agent.uploadedFiles = {});

  async function readJSModuleValue(path) {
    const source = await fs.readFile(path, {
      encoding: "utf8",
    });
    let dependencies = null;
    let moduleData = null;
    try {
      const parsedBabel = babel.transform(source, {
        sourceMaps: true,
        presets: [presetReact, presetStage0],
        plugins: [
          ({ parse, traverse }) => ({
            visitor: {
              ArrowFunctionExpression(path) {
                if (!dependencies) {
                  const input = path.node.params[0];
                  dependencies = input.properties.map(a => {
                    return a.value.name;
                  });
                }
              },
            },
          }),
        ],
      });
      moduleData = {
        dependencies,
        type: "JSModule",
        code: parsedBabel.code,
        map: parsedBabel.map,
        source,
      };
    } catch (e) {
      moduleData = {
        dependencies,
        type: "JSModule",
        error: e.message,
      };
    }
    return moduleData;
  }

  async function readFileValue(path) {
    const stat = await fs.lstat(path);
    let fileValue = null;
    if (basename(path).match(/.js$/)) {
      return await readJSModuleValue(path);
    }
    if (stat.isDirectory()) {
      let fileNames = await fs.readdir(path);
      fileNames = fileNames.filter(
        f => EMBARASSING_HACK_BAN_FILE_NAMES.indexOf(f) === -1,
      );
      let directory = {};
      try {
        const dirJSON = await fs.readFile(join(path, "Directory.json"));
        directory = JSON.parse(dirJSON);
      } catch (e) {}
      const files = await Promise.all(
        fileNames.sort().map(async fileName => {
          const filePath = join(path, fileName);
          const docID = await checksumPath(filePath);
          return { docID, fileName };
        }),
      );
      return {
        ...directory,
        type: "Directory",
        files,
      };
    } else {
      const file = await fs.readFile(path);
      const isBinary = await isBinaryFile(file, file.length);
      if (isBinary) {
        fileValue = { type: "Buffer", value: file.toString("base64") };
      } else {
        try {
          fileValue = JSON.parse(file.toString());
        } catch (e) {
          fileValue = { type: "String", value: file.toString() };
        }
      }
    }
    return fileValue;
  }

  async function checksumPath(path) {
    const fileValue = await readFileValue(path);
    const id = digest(stringify(fileValue));
    return id;
  }

  async function putPath(path, recordID) {
    const fileValue = await readFileValue(path);

    if (fileValue.type === "Directory") {
      await Promise.all(
        fileValue.files.map(async file => {
          const filePath = join(path, file.fileName);
          await putPath(filePath, recordID);
        }),
      );
    }

    const docID = digest(stringify(fileValue));

    if (uploadedFiles[recordID + docID]) {
      return {
        recordID,
        docID,
      };
    }

    const createDoc = await dispatch({
      type: "CreateDocAction",
      recordID,
      docID,
      authSession,
      authUser,
      value: fileValue,
    });
    uploadedFiles[recordID + docID] = true;
    return {
      recordID,
      docID,
    };
  }

  async function uploadPath(path, recordID) {
    let record = await dispatch({
      type: "GetRecordAction",
      recordID,
      authSession,
      authUser,
    });
    if (!record.id) {
      record = await dispatch({
        type: "SetRecordAction",
        recordID,
        authSession,
        authUser,
        docID: null,
        permission: "PUBLIC",
        owner: authUser,
      });
    }
    const putResult = await putPath(path, recordID);
    await dispatch({
      type: "SetRecordAction",
      recordID,
      authSession,
      authUser,
      docID: putResult.docID,
      permission: "PUBLIC",
      owner: authUser,
    });

    return {
      recordID,
      docID: putResult.docID,
    };
  }

  async function getPath(path, recordID, docID) {
    const doc = await dispatch({
      type: "GetDocAction",
      recordID,
      docID,
      authUser,
      authSession,
    });
    const pathExists = await fs.pathExists(path);
    if (pathExists) {
      throw "Not supported yet! Rm path before downloading, or fix this code";
    }
    if (doc.value.type === "Directory") {
      await fs.mkdir(path);
      await Promise.all(
        doc.value.files.map(async file => {
          const filePath = join(path, file.fileName);
          await getPath(filePath, recordID, file.docID);
        }),
      );
    } else if (doc.value.type === "Buffer") {
      await fs.writeFile(path, new Buffer(doc.value.value, "base64"));
    } else if (doc.value.type === "String") {
      await fs.writeFile(path, doc.value.value);
    } else {
      await fs.writeFile(path, stringify(doc.value));
    }
  }

  async function downloadPath(path, recordID) {
    const record = await dispatch({
      type: "GetRecordAction",
      recordID,
      authSession,
      authUser,
    });
    if (!record || !record.doc) {
      throw "Cannot find record!!:!?"; // todo, consistent error handling on client
    }
    await getPath(path, recordID, record.doc);
  }

  const _providedDirs = {};

  const fsDocs = {};
  const fsRecords = {};

  const _providePathDocs = async (path, recordID) => {
    const value = await readFileValue(path);
    const docID = digest(stringify(value));
    const newRecord = {
      docID,
      owner: "FSAgent",
    };
    if (fsDocs[docID]) {
      return newRecord;
    }
    fsDocs[docID] = {
      docID,
      recordID,
      value,
    };
    if (value.type === "Directory") {
      await Promise.all(
        value.files.map(async file => {
          const filePath = join(path, file.fileName);
          await _providePathDocs(filePath, recordID);
        }),
      );
    }

    return newRecord;
  };

  const provideDirectory = async (path, recordID) => {
    _providedDirs[recordID] = path;
    const record = await _providePathDocs(path, recordID);
    fsRecords[recordID] = { ...record, recordID };
    return () => {
      delete _providedDirs[recordID];
    };
  };

  const invalidateDirectory = async path => {
    await Promise.all(
      Object.entries(_providedDirs).map(async recordCommaPath => {
        if (recordCommaPath[1] === path) {
          const recordID = recordCommaPath[0];
          const record = await _providePathDocs(path, recordID);
          fsRecords[recordID] = { ...record, recordID };
        }
      }),
    );
  };

  const onDispatch = async action => {
    if (action.type === "GetRecordAction") {
      const providedDir = _providedDirs[action.recordID];
      const fsRecord = fsRecords[action.recordID];
      if (providedDir && fsRecord) {
        return fsRecord;
      }
      const record = await dispatch(action);
      return record;
    }
    if (action.type === "GetDocAction") {
      const fsDoc = fsDocs[action.docID];
      if (fsDoc) {
        return fsDoc;
      }
    }
    return await dispatch(action);
  };

  return {
    ...agent,
    checksumPath,
    putPath,
    uploadPath,
    getPath,
    downloadPath,
    dispatch: onDispatch,
    authUser,
    authSession,
    provideDirectory,
    invalidateDirectory,
  };
}

module.exports = FSAgent;
