const mime = require("mime-types");
const { parse } = require("path");

const _platformDepNames = ["React"];
async function ExecJSModule(app, module, context) {
  if (module.type !== "JSModule") {
    return module;
  }
  const remoteDeps = module.dependencies.filter(
    dep => _platformDepNames.indexOf(dep) === -1,
  );

  const deps = {};
  const depsNotFound = [];

  await Promise.all(
    remoteDeps.map(async remoteDep => {
      let childDocID = null;
      context.find(parentContext => {
        if (parentContext.files) {
          return parentContext.files.find(file => {
            if (parse(file.fileName).name === remoteDep) {
              childDocID = file.docID;
              return true;
            }
          });
        }
      });
      let childRecordID = null;
      context.find(parentContext => {
        if (parentContext.recordID) {
          childRecordID = parentContext.recordID;
          return true;
        }
      });
      if (!childDocID) {
        childRecordID = remoteDep;
        const depModuleRecord = await app.dispatch.GetRecordAction({
          recordID: childRecordID,
        });
        if (depModuleRecord && depModuleRecord.doc) {
          childDocID = depModuleRecord.doc;
        }
      }
      if (!childDocID || !childRecordID) {
        depsNotFound.push(remoteDep);
        return;
      }
      const depModule = await app.dispatch.GetDocAction({
        recordID: childRecordID,
        docID: childDocID,
      });
      if (!depModule) {
        depsNotFound.push(remoteDep);
        return;
      }
      deps[remoteDep] = await ExecJSModule(app, depModule, context);
    }),
  );

  console.log("ready to eval", deps, module, depsNotFound);

  if (depsNotFound.length) {
    throw {
      statusCode: 404,
      message: "dependencies not found: " + depsNotFound.join(),
    };
  }

  computedDoc = eval(module.code)(deps);

  return computedDoc;
}

async function ExecDocAtPath(app, path, docID, res, context) {
  const doc = await app.dispatch.GetDocAction({
    docID: docID,
    recordID: "App",
  });

  if (!doc) {
    throw {
      statusCode: 404,
      code: "INVALID_DOC",
      message: `Doc not found for path`,
    };
  }

  if (path === "") {
    const type = doc.value.type;
    const fileName = context && context[0] && context[0].fileName;
    const contentType = fileName && mime.lookup(fileName);
    contentType && res.set({ "content-type": contentType });
    switch (type) {
      case "Buffer": {
        const buf = Buffer.from(doc.value.value, "base64");
        res.send(buf);
        return;
      }
      case "JSModule": {
        const result = await ExecJSModule(app, doc.value, context);
        if (typeof result === "string") {
          res.send(result);
        } else if (result.responseValue) {
          result.statusCode && res.statusCode(result.statusCode);
          result.headers && result.set(headers);
          res.send(result.responseValue);
        } else {
          res.json(result);
        }
        return;
      }
      case "String": {
        res.send(doc.value.value);
        return;
      }
      case "Directory": {
        const indexTypes = ["html", "js"];
        let foundIndexFile = null;
        indexTypes.find(indexType =>
          doc.value.files.find(file => {
            if (file.fileName === `index.${indexType}`) {
              foundIndexFile = file;
              return true;
            }
          }),
        );
        if (foundIndexFile && foundIndexFile.docID) {
          const pathParts = path.split("/");
          const childPath = pathParts.slice(1).join("/");
          const childDocID = foundIndexFile.docID;
          return await ExecDocAtPath(app, childPath, childDocID, res, [
            {
              ...foundIndexFile,
              files: doc.value.files,
            },
            ...context,
          ]);
        }
        res.json(doc.value);
        return;
      }
      default: {
        res.json(doc.value);
        return;
      }
    }
  }

  if (!doc.value || doc.value.type !== "Directory") {
    throw {
      statusCode: 404,
      code: "INVALID_DOC",
      message: `Doc is not a directory`,
    };
  }

  const pathParts = path.split("/");

  let selectedFile = null;
  doc.value.files.find(file => {
    if (file.fileName === pathParts[0]) {
      selectedFile = file;
      return true;
    }
    return false;
  });
  if (!selectedFile) {
    doc.value.files.find(file => {
      if (file.fileName === pathParts[0] + ".js") {
        selectedFile = file;
        return true;
      }
      return false;
    });
  }
  if (!selectedFile) {
    doc.value.files.find(file => {
      if (file.fileName === pathParts[0] + ".html") {
        selectedFile = file;
        return true;
      }
      return false;
    });
  }
  if (!selectedFile) {
    throw {
      statusCode: 404,
      code: "INVALID_PATH",
      message: `Path is not valid`,
      fields: path,
    };
  }

  const childPath = pathParts.slice(1).join("/");
  const childDocID = selectedFile && selectedFile.docID;
  if (childDocID) {
    return await ExecDocAtPath(app, childPath, childDocID, res, [
      {
        ...selectedFile,
        files: doc.value.files,
      },
      ...context,
    ]);
  }

  throw {
    code: 500,
    message: "Cannot handle this file",
    fields: { doc },
  };
}

async function ExecServerApp(app, req, res) {
  const result = await app.dispatch.GetRecordAction({ recordID: "App" });
  if (!result || !result.doc) {
    throw {
      statusCode: 404,
      code: "INVALID_APP",
      message: "App Record doc not found!",
    };
  }
  const topPath = req.path.slice(1);
  await ExecDocAtPath(app, topPath, result.doc, res, [
    { recordID: "App", docID: result.doc },
  ]);
}

module.exports = ExecServerApp;
