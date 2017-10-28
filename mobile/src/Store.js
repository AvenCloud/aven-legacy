import { Alert, AsyncStorage } from "react-native";

let ws = null;
let wsIsReady = false;

const onWsOpen = () => {
  console.log(
    "Connection Open. TODO- send list of currently subscribed projects"
  );
  wsIsReady = true;
  queuedWsMessages.map(sendWs);
  queuedWsMessages = [];
};

const onWsMessage = async e => {
  const msgParts = e.data.split("_");
  const type = msgParts[0];
  const name = msgParts[1];
  const value = msgParts[2];
  switch (type) {
    case "PublishAccount":
      Store.freshenRemote("Account");
      return;
    case "PublishProject":
      const project = await Store.getLocal(`Project_${name}`);
      if (!project) {
        return;
      }
      Store.setLocal(`Project_${name}`, {
        ...project,
        rootDoc: value
      });
      return;
  }
};

const onWsError = e => {};

const onWsClose = e => {
  wsIsReady = false;
  console.log("Connection Closed", e.code, e.reason);
  ws = null;

  setTimeout(() => {
    ws = new WebSocket("ws://localhost:5000");
    ws.onopen = onWsOpen;
    ws.onclose = onWsClose;
    ws.onerror = onWsError;
    ws.onmessage = onWsMessage;
  }, 3000);
};

ws = new WebSocket("ws://localhost:5000");
ws.onopen = onWsOpen;
ws.onclose = onWsClose;
ws.onerror = onWsError;
ws.onmessage = onWsMessage;

let queuedWsMessages = [];
const sendWs = message => {
  if (wsIsReady) {
    ws.send(message);
  } else {
    queuedWsMessages.push(message);
  }
};

//   // connection opened
//   ws.send("subscribe", "foo"); // send a message
//   ws.send("subscribe", "bar"); // send a message
//   ws.send("unsubscribe", "foo"); // send a message
// };

class Store {
  static _localDocuments = {};
  static _listeners = {};

  static emit(name, data) {
    const listenerSet = Store._listeners[name] || (Store._listeners[name] = []);
    listenerSet.forEach(listener => {
      listener(data);
    });
  }

  static async writeProjectFile(data, projectId, path) {
    const project = await Store.getProject(projectId);
    const docId = await Store.writeDocument(data, projectId);
    const newRootDoc = await Store.writeInFolder(
      projectId,
      project.rootDoc,
      path,
      docId
    );
    await Store.writeProject(projectId, newRootDoc);
  }

  static async writeInFolder(projectId, lastId, path, newFileValue) {
    const lastFolder = lastId && (await Store.getDocument(projectId, lastId));
    const folder = lastFolder
      ? { ...lastFolder }
      : { type: "Folder", files: {} };
    const files = folder.files ? { ...folder.files } : {};
    if (path.length === 1) {
      const fileName = path[0];
      files[fileName] = {
        name: fileName,
        value: newFileValue
      };
    } else if (path.length > 1) {
      const subPath = path.slice();
      const fileName = subPath.splice(0, 1)[0];
      const lastFile = files[fileName];
      files[fileName] = {
        name: fileName,
        value: await writeInFolder(
          projectId,
          lastFile && lastFile.value,
          subPath,
          newFileValue
        )
      };
    } else {
      return null;
    }
    const docId = await Store.writeDocument({ ...folder, files }, projectId);
    return docId;
  }

  static async writeDocument(data, projectId) {
    const projectIdPaths = projectId.split("/");
    const result = await Store.dispatchRemote({
      type: "CreateDocAction",
      user: projectIdPaths[0],
      project: projectIdPaths[1],
      data: JSON.stringify(data)
    });
    return result && result.docId;
  }

  static async writeProject(projectId, rootDoc) {
    const projectIdPaths = projectId.split("/");
    const projectName = projectIdPaths[1];
    Store.dispatchRemote({
      type: "SetProjectAction",
      rootDoc,
      projectName
    });
  }

  static async listen(name, handler) {
    const localIdParts = name.split("_");
    const type = localIdParts[0];
    const arg0 = localIdParts[1];
    switch (type) {
      case "Account":
        const session = await Store.getLocal("Session");
        sendWs(`ListenAccount_${session.username}`);
        break;
      case "Project":
        sendWs(`ListenProject_${arg0}`);
        break;
      default:
        break;
    }
    const listenerSet = Store._listeners[name] || (Store._listeners[name] = []);
    listenerSet.push(handler);
  }

  static async unlisten(name, handler) {
    const localIdParts = name.split("_");
    const type = localIdParts[0];
    const arg0 = localIdParts[1];
    switch (type) {
      case "Account":
        const session = await Store.getLocal("Session");
        sendWs(`UnlistenAccount_${session.username}`);
        break;
      case "Project":
        sendWs(`UnlistenProject_${arg0}`);
        break;
      default:
        break;
    }

    const listenerSet = Store._listeners[name] || (Store._listeners[name] = []);
    const listenerIndex = listenerSet.indexOf(handler);
    if (listenerIndex !== -1) {
      listenerSet.splice(listenerIndex, 1);
    }
  }

  static async _handleRemoteGet(localId, action) {
    const remoteDoc = await Store.dispatchRemote(action);
    await Store.setLocal(localId, remoteDoc);
    return remoteDoc;
  }

  static async freshenRemote(localId) {
    const localIdParts = localId.split("_");
    const type = localIdParts[0];
    const projectId = localIdParts[1];
    const user = projectId && projectId.split("/")[0];
    const project = projectId && projectId.split("/")[1];
    const id = localIdParts[2];
    switch (type) {
      case "Account":
        return Store._handleRemoteGet(localId, {
          type: "GetAccountAction"
        });
      case "Project":
        return Store._handleRemoteGet(localId, {
          type: "GetProjectAction",
          user,
          project
        });
      case "Document":
        if (!id || id == null || id === "null") {
          debugger;
        }
        // document IDs are immutable (content-addressable), so we don't need to load them remotely if we have them here
        const localDoc = await Store.getLocal(localId);
        if (localDoc) {
          return localDoc;
        }
        return Store._handleRemoteGet(localId, {
          type: "GetDocAction",
          user,
          project,
          id
        });
      default:
        return undefined;
    }
  }

  static async get(localId) {
    await Store.freshenRemote(localId);
    return await Store.getLocal(localId);
  }

  static async getProject(projectId) {
    return await Store.get(`Project_${projectId}`);
  }

  static async getDocument(projectId, docId) {
    if (docId === "null" || !docId) {
      debugger;
    }
    return await Store.get(`Document_${projectId}_${docId}`);
  }

  static async getAndListen(localId, handler) {
    await Store.listen(localId, handler);
    const data = await Store.getLocal(localId);
    handler(data);
    // todo, propaer caching somehow lol
    await Store.freshenRemote(localId);
  }
  static async setLocal(localId, data) {
    const storedData = JSON.stringify(data);
    await AsyncStorage.setItem("AvenDocument_" + localId, storedData);
    Store._localDocuments[localId] = data;
    Store.emit(localId, data);
  }
  static async getLocal(localId) {
    let data = Store._localDocuments[localId];
    if (data !== undefined) {
      return data;
    }
    const storedData = await AsyncStorage.getItem("AvenDocument_" + localId);
    if (storedData) {
      try {
        data = JSON.parse(storedData);
      } catch (e) {
        data = storedData;
      }
    }
    Store._localDocuments[localId] = data;
    return data;
  }
  static async dispatchRemote(action, inputSession) {
    const session = inputSession || (await Store.getLocal("Session"));
    const { isSecure, host } = session;
    const methodHost = `http${isSecure ? "s" : ""}://${host}`;
    console.log("dude", methodHost);
    const res = await fetch(`${methodHost}/api/dispatch`, {
      method: "post",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-Aven-Auth-Username": session && session.username,
        "X-Aven-Auth-Session": session && session.session
      },
      body: JSON.stringify(action)
    });
    const textBody = await res.text();
    let body = textBody;
    try {
      body = textBody && JSON.parse(textBody);
    } catch (e) {}
    console.log("Dispatch! ", action, body);
    return body;
  }
  static async login(data) {
    // {username, session, host, isSecure}
    const body = await Store.dispatchRemote(
      {
        type: "AuthLoginAction",
        username: data.username,
        password: data.password
      },
      {
        host: data.host,
        isSecure: data.isSecure
      }
    );
    if (body && body.session) {
      Store.setLocal("Session", {
        session: body.session,
        username: body.username,
        host: data.host,
        isSecure: data.isSecure
      });
      return;
    } else {
      throw "Error on server";
    }
  }
  static async logout() {
    try {
      await Store.dispatchRemote({
        type: "AuthLogoutAction"
      });
    } catch (e) {
      Alert.alert(
        "Logout request failed",
        "Would you still like to dismiss your local session?",
        [
          {
            text: "Yes, Log Out",
            onPress: async () => {
              await AsyncStorage.clear();
              await Store.setLocal("Session", null);
            }
          },
          {
            text: "Cancel Logout",
            onPress: () => {},
            style: "cancel"
          }
        ],
        { cancelable: true }
      );
      return;
    }
    await Store.setLocal("Session", null);
  }
}

module.exports = Store;
