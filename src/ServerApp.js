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
  const path = req.path.slice(1);

  const execResult = await agent.exec(docID, mainRecord, path);
  if (React.Component.isPrototypeOf(execResult)) {
    const App = execResult;
    res.set("content-type", "text/html");
    const { path, query } = req;
    // Horrible horrible horrible hacks to support react native web styles:
    const appKey = `App-${docID}-${path}-${JSON.stringify(query)}`;
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

    const title = App.title;
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
  } else if (typeof execResult === "string") {
    res.send(execResult);
  } else if (typeof execResult === "function") {
    await execResult(agent, req, res);
  } else if (React.isValidElement(execResult)) {
    res.set("content-type", "text/html");
    const html = ReactDOMServer.renderToString(execResult);
    res.send(`<!doctype html>${html}`);
  } else if (typeof execResult === "string") {
    res.send(execResult);
  } else if (execResult.responseValue) {
    execResult.statusCode && res.statusCode(execResult.statusCode);
    execResult.headers && res.set(execResult.headers);
    res.send(execResult.responseValue);
  } else if (execResult.type === "Buffer") {
    if (execResult.contentType) {
      res.set("Content-Type", execResult.contentType);
    }
    const buf = Buffer.from(execResult.value, "base64");
    res.send(buf);
  } else if (execResult.type === "String") {
    if (execResult.contentType) {
      res.set("Content-Type", execResult.contentType);
    }
    res.send(execResult.value);
  } else {
    res.json(execResult);
  }
  return;
}

module.exports = ServerApp;
