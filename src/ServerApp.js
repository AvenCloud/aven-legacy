const mime = require("mime-types");
const pathParse = require("path").parse;
const React = require("react");
const ReactDOMServer = require("react-dom/server");

// Having troubles with ReactNativeWeb depending on ART depending on document global..
// I attempted to use the react-native-web babel plugin, but it caused a compile-time crash while art depended on global.document...
// https://github.com/necolas/react-native-web/issues/737
if (typeof document === "undefined") {
  global.document = {
    createElement: () => null,
  };
}
const { AppRegistry } = require("react-native-web");

async function ExecDocAtPath(agent, path, docID, { req, res }, context) {
  const doc = await agent.dispatch({
    type: "GetDocAction",
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
    switch (type) {
      case "Buffer": {
        const fileName = context && context[0] && context[0].fileName;
        const contentType = fileName && mime.lookup(fileName);
        res.set("Content-Type", contentType);
        const buf = Buffer.from(doc.value.value, "base64");
        res.send(buf);
        return;
      }
      case "String": {
        const fileName = context && context[0] && context[0].fileName;
        const contentType = fileName && mime.lookup(fileName);
        contentType && res.set("content-type", contentType);
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
          return await ExecDocAtPath(
            agent,
            childPath,
            childDocID,
            { req, res },
            [
              {
                ...foundIndexFile,
                files: doc.value.files,
              },
              ...context,
            ],
          );
        }
        res.json(doc.value);
        return;
      }
      default: {
        break;
      }
    }
  }
  if (doc.value.type === "JSModule") {
    const result = await agent.exec(doc, context);
    if (React.Component.isPrototypeOf(result)) {
      const App = result;
      res.set("content-type", "text/html");
      const { path, query } = req;
      // Horrible horrible hacks to support react native web styles:
      const appKey = `App-${docID}`;
      const appKeys = AppRegistry.getAppKeys();
      if (appKeys.indexOf(appKey) === -1) {
        AppRegistry.registerComponent(appKey, () => App);
      }
      const { element, getStyleElement } = AppRegistry.getApplication(appKey, {
        path,
        query,
      });
      const appHtml = ReactDOMServer.renderToString(element);
      const css = ReactDOMServer.renderToStaticMarkup(getStyleElement());

      const title = "AaaAaayvvyen";
      res.send(`
<!doctype html>
<html>
<head>
  <link rel="stylesheet" href="/assets/normalize.css" />
  <link rel="stylesheet" href="/assets/app.css" />
  <title>${title}</title>
  ${css}
  <script>
    window.avenEnv = ${JSON.stringify(agent.env)};
  </script>
</head>
<body>
  <div id="root">
${appHtml}
  </div>
  <script type="text/javascript" src="/_client_app.js"></script>
</body>
</html>
`);
    } else if (typeof result === "string") {
      res.send(result);
    } else if (typeof result === "function") {
      await result(agent, req, res);
    } else if (React.isValidElement(result)) {
      res.set("content-type", "text/html");
      const html = ReactDOMServer.renderToString(result);
      res.send(`<!doctype html>${html}`);
    } else if (typeof result === "string") {
      res.send(result);
    } else if (result.responseValue) {
      result.statusCode && res.statusCode(result.statusCode);
      result.headers && res.set(result.headers);
      res.send(result.responseValue);
    } else {
      res.json(result);
    }
    return;
  }

  if (!doc.value || doc.value.type !== "Directory") {
    res.json(doc.value);
    return;
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
      if (pathParse(file.fileName).name === pathParts[0]) {
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
    return await ExecDocAtPath(agent, childPath, childDocID, { req, res }, [
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

async function ServerApp(agent, req, res, mainRecord) {
  const result = await agent.dispatch({
    type: "GetRecordAction",
    recordID: mainRecord,
  });
  const { docID } = result;
  if (!result || !docID) {
    throw {
      statusCode: 404,
      code: "INVALID_APP",
      message: `App Record doc "${mainRecord}" not found!`,
    };
  }
  const topPath = req.path.slice(1);
  await ExecDocAtPath(agent, topPath, docID, { req, res }, [
    { recordID: mainRecord, docID },
  ]);
}

module.exports = ServerApp;
