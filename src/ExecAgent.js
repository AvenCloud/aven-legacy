const pathParse = require("path-parse");
const pathJoin = require("path-browserify").join;

const ExecAgent = (agent, platformDeps) => {
  async function exec(docID, recordID, path, optionalParentDocs) {
    let parentDocs = optionalParentDocs || [];

    const doc = await agent.dispatch({
      type: "GetDocAction",
      docID,
      recordID,
    });

    const moduleDoc = doc.value;
    if (moduleDoc.type === "Directory") {
      if (path === "") {
        const indexFile = moduleDoc.files.find(f => f.fileName === "index.js");
        if (indexFile) {
          return await exec(docID, recordID, "index.js", parentDocs);
        } else {
          return doc;
        }
      }
      const pathParts = path.split("/");
      const restOfPath = pathParts.slice(1).join("/");
      let childDocID = null;
      moduleDoc.files.find(file => {
        if (file.fileName === pathParts[0]) {
          childDocID = file.docID;
          return true;
        }
      });
      if (!childDocID) {
        moduleDoc.files.find(file => {
          const baseFileName = pathParse(file.fileName).name;
          if (baseFileName === pathParts[0]) {
            childDocID = file.docID;
            return true;
          }
        });
      }
      if (childDocID) {
        return await exec(childDocID, recordID, restOfPath, [
          doc,
          ...parentDocs,
        ]);
      }
      if (!path) {
        return null;
      }
      const immediateParent = parentDocs[0];
      if (immediateParent) {
        return await exec(
          immediateParent.docID,
          immediateParent.recordID,
          path,
          parentDocs.slice(1),
        );
      }
      if (moduleDoc.inheritRecord) {
        const inheritRecord = await agent.dispatch({
          type: "GetRecordAction",
          recordID: moduleDoc.inheritRecord,
        });
        if (!inheritRecord || !inheritRecord.docID) {
          return null;
        }
        return await exec(inheritRecord.docID, inheritRecord.recordID, path);
      }

      return null;
    }
    if (moduleDoc.type !== "JSModule") {
      // we can only really execute js modules and directories with paths
      return moduleDoc;
    }
    if (moduleDoc.error) {
      return moduleDoc.error;
    }

    const basicDeps = { ...platformDeps, Agent: agent };
    const basicDepNames = Object.keys(basicDeps);
    const remoteDeps = moduleDoc.dependencies.filter(
      dep => basicDepNames.indexOf(dep) === -1,
    );

    const deps = { ...basicDeps };
    const depsNotFound = [];

    await Promise.all(
      remoteDeps.map(async remoteDep => {
        const depPath = pathJoin(pathParse(path).dir, remoteDep);
        const directParent = optionalParentDocs[0];
        const grandParents = optionalParentDocs.slice(1);
        if (!directParent) {
          throw "Every JS module is expected to run within a folder";
        }
        const executedDep = await exec(
          directParent.docID,
          directParent.recordID,
          depPath,
          grandParents,
        );
        if (!executedDep) {
          depsNotFound.push(remoteDep);
          return;
        }
        deps[remoteDep] = executedDep;
      }),
    );

    if (depsNotFound.length) {
      throw {
        statusCode: 404,
        message: "dependencies not found: " + depsNotFound.join(),
      };
    }
    let computedDoc = null;
    try {
      computedDoc = eval(moduleDoc.code)(deps);
    } catch (e) {
      computedDoc = {
        error: {
          message: e.message,
        },
      };
    }

    return computedDoc;
  }

  return {
    ...agent,
    exec,
  };
};

module.exports = ExecAgent;
