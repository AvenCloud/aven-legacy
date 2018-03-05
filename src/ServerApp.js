const mime = require("mime-types");
const pathParse = require("path").parse;
const React = require("react");
const ClientAuthAgent = require("./ClientAuthAgent");
const PlatformDeps = require("./PlatformDeps");
const ExecAgent = require("./ExecAgent");
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

async function respondWithApp(App, props, res, path, docID, clientAgent) {
  res.set("content-type", "text/html");
  // Horrible horrible horrible hacks to support react native web styles:
  const appKey = `App-${docID}-${path}`;
  const appKeys = AppRegistry.getAppKeys();
  if (appKeys.indexOf(appKey) === -1) {
    AppRegistry.registerComponent(appKey, () => App);
  }
  const { element, getStyleElement } = AppRegistry.getApplication(appKey, {
    initialProps: props,
  });
  const appHtml = ReactDOMServer.renderToString(element);
  const css = ReactDOMServer.renderToStaticMarkup(getStyleElement());

  const title = App.title;
  const html = `
<!doctype html>
<html>
<head>
<link rel="stylesheet" href="/assets/normalize.css" />
<link rel="stylesheet" href="/assets/app.css" />
<title>${title}</title>
${css}
<script>
  window.avenEnv = ${JSON.stringify(clientAgent.env)};
</script>
</head>
<body>
<div id="root">
${appHtml}
</div>
<script type="text/javascript" src="/_client_app.js"></script>
<script type="text/javascript">
window.avenDocCache = ${JSON.stringify(clientAgent.dumpCache())};
</script>
</body>
</html>
`;
  res.send(html);
}

async function RunErrorApp(agent, req, res, mainRecord, error) {
  const errorPagePath = "ErrorPage";
  const authAgent = ClientAuthAgent(agent);
  const clientAgent = await ExecAgent(authAgent, PlatformDeps);

  const record = await clientAgent.dispatch({
    type: "GetRecordAction",
    recordID: mainRecord,
  });
  const { docID } = record;
  if (!record || !docID) {
    throw {
      statusCode: 404,
      code: "INVALID_APP",
      message: `App Record doc "${mainRecord}" not found!`,
    };
  }

  const ErrorApp = await clientAgent.execDoc(docID, mainRecord, errorPagePath);
  const { path, query } = req;
  await respondWithApp(
    ErrorApp,
    { path, query, error },
    res,
    errorPagePath,
    docID,
    clientAgent,
  );
}

async function RunServerApp(agent, req, res, mainRecord) {
  const authAgent = ClientAuthAgent(agent);
  const clientAgent = await ExecAgent(authAgent, PlatformDeps);
  // clientAgent.setSession(cookie.authUserID, cookie.authSession)
  const result = await clientAgent.dispatch({
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

  const execResult = await clientAgent.execDoc(docID, mainRecord, path);
  if (execResult == null) {
    throw {
      statusCode: 404,
      code: "PATH_NOT_FOUND",
      message: `Cannot find "${path}"`,
      path,
      record: mainRecord,
    };
    res.status(404).send("Not found");
  } else if (React.Component.isPrototypeOf(execResult)) {
    const { path, query } = req;
    await respondWithApp(
      execResult,
      {
        path,
        query,
      },
      res,
      path,
      docID,
      clientAgent,
    );
  } else if (typeof execResult === "string") {
    res.send(execResult);
  } else if (typeof execResult === "function") {
    await execResult(clientAgent, req, res);
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

async function ServerApp(agent, req, res, mainRecord) {
  try {
    await RunServerApp(agent, req, res, mainRecord);
  } catch (e) {
    await RunErrorApp(agent, req, res, mainRecord, e);
  }
}

module.exports = ServerApp;
