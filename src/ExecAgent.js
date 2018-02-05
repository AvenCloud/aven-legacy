const React = require("react");
const ReactDOM = require("react-dom");
const pathParse = require("path").parse;

const Platform = {
  web: true,
  webServer: true,
  webBrowser: false,
  mobile: false,
  os: "web",
};
const _platformDeps = {
  Platform,
  React,
  _npm_react: React,
  _npm_react_dom: ReactDOM,
  _npm_react_native: null,
};
const _platformDepNames = Object.keys(_platformDeps);

const ExecAgent = agent => {
  async function exec(doc, context) {
    const recordID = context[context.length - 1].recordID;
    const moduleDoc = doc.value;
    if (moduleDoc.type !== "JSModule") {
      console.log("here goes", moduleDoc);
      if (moduleDoc.type === "Directory") {
        const indexFile = moduleDoc.files.find(f => f.fileName === "index.js");
        console.log("here indexFile", indexFile);
        if (indexFile) {
          const doc = await agent.dispatch({
            type: "GetDocAction",
            docID: indexFile.docID,
            recordID,
          });
          console.log("here doc", doc);

          return await exec(doc, context);
        }
      }
      return moduleDoc;
    }
    if (moduleDoc.error) {
      return moduleDoc.error;
    }
    const remoteDeps = moduleDoc.dependencies.filter(
      dep => _platformDepNames.indexOf(dep) === -1,
    );

    const deps = { ..._platformDeps };
    const depsNotFound = [];

    await Promise.all(
      remoteDeps.map(async remoteDep => {
        let childDocID = null;
        context.find(parentContext => {
          if (parentContext.files) {
            return parentContext.files.find(file => {
              if (pathParse(file.fileName).name === remoteDep) {
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
          const depModuleRecord = await agent.dispatch({
            type: "GetRecordAction",
            recordID: childRecordID,
          });
          if (depModuleRecord && depModuleRecord.docID) {
            childDocID = depModuleRecord.docID;
          }
        }
        if (!childDocID || !childRecordID) {
          depsNotFound.push(remoteDep);
          return;
        }
        const depModule = await agent.dispatch({
          type: "GetDocAction",
          recordID: childRecordID,
          docID: childDocID,
        });
        if (!depModule) {
          depsNotFound.push(remoteDep);
          return;
        }
        const executedDep = await exec(depModule, context);
        deps[remoteDep] = executedDep;
      }),
    );

    if (depsNotFound.length) {
      throw {
        statusCode: 404,
        message: "dependencies not found: " + depsNotFound.join(),
      };
    }
    computedDoc = eval(moduleDoc.code)(deps);

    return computedDoc;
  }

  return {
    ...agent,
    exec,
  };
};

module.exports = ExecAgent;
