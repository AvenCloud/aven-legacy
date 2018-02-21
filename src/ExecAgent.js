const pathParse = require("path-parse");
const pathJoin = require("path").join;

let debugDummyCount = 0;

const ExecAgent = (agent, platformDeps) => {
  // async function execWithContext(docID, recordID, parentDocs, path) {
  //   const doc = await agent.dispatch({
  //     type: "GetDocAction",
  //     docID,
  //     recordID,
  //   });
  //   if (!doc) {
  //     return doc;
  //   }
  //   if (doc.value.type === "Directory") {
  //     if (path === "") {
  //       return doc;
  //     }
  //   }
  // }

  async function exec(docID, recordID, path, optionalParentDocs) {
    // debugDummyCount++;
    // if (debugDummyCount > 100) {
    //   throw "Dude just stop";
    // }
    let parentDocs = optionalParentDocs || [];

    const doc = await agent.dispatch({
      type: "GetDocAction",
      docID,
      recordID,
    });

    console.log("Exec", doc.value.type, path, parentDocs.length);
    const moduleDoc = doc.value;
    if (moduleDoc.type === "Directory") {
      if (path === "") {
        const indexFile = moduleDoc.files.find(f => f.fileName === "index.js");
        if (indexFile) {
          console.log("Handling index behavior!!");
          return await exec(docID, recordID, "index.js", parentDocs);
          //   ...context,
          //   {
          //     ...moduleDoc,
          //     recordID,
          //     fileName: indexFile.fileName,
          //     docID: indexFile.docID,
          //   },
          // ]);
        } else {
          return doc;
        }
      }
      // console.log("consider directory", path, moduleDoc);
      const firstPartOfPath = path.split("/")[0];
      const restOfPath = path
        .split("/")
        .slice(1)
        .join("/");
      let childDocID = null;
      moduleDoc.files.find(file => {
        if (file.fileName === firstPartOfPath) {
          childDocID = file.docID;
          return true;
        }
      });
      if (!childDocID) {
        moduleDoc.files.find(file => {
          const baseFileName = pathParse(file.fileName).name;
          if (baseFileName === firstPartOfPath) {
            childDocID = file.docID;
            return true;
          }
        });
      }
      if (childDocID) {
        // console.log("Executing child! ", { childDocID, restOfPath, path });
        return await exec(childDocID, recordID, restOfPath, [
          doc,
          ...parentDocs,
        ]);
      }
      if (!path) {
        return null;
      }
      // throw "I dont understand: " +
      //   JSON.stringify({ path, recordID, docID, parentDocs, restOfPath });
      const immediateParent = parentDocs[0];
      return await exec(
        immediateParent.docID,
        immediateParent.recordID,
        path,
        parentDocs.slice(1),
      );
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
        // let childDocID = null;
        // let childRecordID = null;

        // context.find(parentContext => {
        //   if (parentContext.files) {
        //     const foundFile = parentContext.files.find(file => {
        //       if (pathParse(file.fileName).name === remoteDep) {
        //         childRecordID = parentContext.recordID;
        //         childDocID = file.docID;
        //         return true;
        //       }
        //     });
        //     if (!foundFile && parentContext.inheritRecord) {
        //       console.log("SHIT OK INHERIT FPR " + remoteDep);
        //       return true;
        //     }
        //   }
        // });

        // if (!childDocID) {
        //   childRecordID = remoteDep;
        //   const depModuleRecord = await agent.dispatch({
        //     type: "GetRecordAction",
        //     recordID: childRecordID,
        //   });
        //   if (depModuleRecord && depModuleRecord.docID) {
        //     childDocID = depModuleRecord.docID;
        //   }
        // }
        // if (!childDocID || !childRecordID) {
        //   depsNotFound.push(remoteDep);
        //   return;
        // }
        // console.log(
        //   "Executing dependency!",
        //   remoteDep,
        //   childDocID,
        //   childRecordID,
        // );
        const depPath = pathJoin(pathParse(path).dir, remoteDep);
        const directParent = optionalParentDocs[0];
        const grandParents = optionalParentDocs.slice(1);
        if (!directParent) {
          throw "Every JS module is expected to run within a folder";
        }
        console.log("Getting dep with path", {
          path,
          remoteDep,
          depPath,
          directParent,
        });
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
      computedDoc = null;
    }

    return computedDoc;
  }

  return {
    ...agent,
    exec,
  };
};

module.exports = ExecAgent;
