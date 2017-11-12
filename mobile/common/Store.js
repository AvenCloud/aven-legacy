const SHA1 = require("crypto-js/sha1");
const Hex = require("crypto-js/format-hex");

class Store {
  static _localDocuments = {};
  static _listeners = {};
  static _isWsConnected = false;
  static _ws = null;
  static _localStorage = null;
  static _remoteActionRequests = [];
  static _publishedDocuments = [];
  static _optimisticProjectRoots = {};

  static init = ({ localStorage, platformDeps }) => {
    Store._localStorage = localStorage;
    Store.attachWebsocket();
    Store._platformDeps = platformDeps;
    Store._platformDepNames = Object.keys(platformDeps);
  };

  static _onWebsocketOpen = () => {
    console.log("Websocket connected!");
    Store.sendRemoteListeners();
    Store._isWsConnected = true;
    Store._queuedWsMessages.map(Store.sendWebsocketMessage);
    Store._queuedWsMessages = [];
  };

  static _onWebsocketMessage = async e => {
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

  static _onWebsocketClose = e => {
    Store.detachWebsocket();
    console.log("Connection Closed or Errored", e.code, e.reason);

    // we assume this diconnection. Wait a bit and retry
    setTimeout(() => {
      Store.attachWebsocket();
    }, 10000);
  };

  static attachWebsocket = async () => {
    await Store.detachWebsocket();
    const session = await Store.getLocal("Session");
    if (!session) {
      return;
    }
    const { isSecure, host } = session;
    const protocolAndHost = `ws${isSecure ? "s" : ""}://${host}`;
    console.log("Connecting to ", protocolAndHost, session);
    Store._ws = new WebSocket(protocolAndHost);
    Store._ws.onopen = Store._onWebsocketOpen;
    Store._ws.onclose = Store._onWebsocketClose;
    Store._ws.onerror = Store._onWebsocketClose;
    Store._ws.onmessage = Store._onWebsocketMessage;
  };

  static detachWebsocket = async () => {
    if (Store._ws) {
      Store._ws.close();
    }
    Store._ws = null;
    Store._isWsConnected = false;
  };

  static _queuedWsMessages = [];
  static sendWebsocketMessage = message => {
    if (Store._ws && Store._isWsConnected) {
      // So, the ws library fails if the ready state is 'connecting'
      if (Store._ws.readyState === 1) {
        Store._ws.send(message);
      }
    } else {
      Store._queuedWsMessages.push(message);
    }
  };

  static emit(name, data) {
    const listenerSet = Store._listeners[name] || (Store._listeners[name] = []);
    listenerSet.forEach(listener => {
      listener(data);
    });
  }

  static async writeProjectFile(data, projectId, path) {
    const project = await Store.getProject(projectId);
    const { docId } = await Store.writeDocument(data, projectId);
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
    const { docId } = await Store.writeDocument(
      { ...folder, files },
      projectId
    );
    return docId;
  }

  static async writeDocument(doc, projectId) {
    const projectIdPaths = projectId.split("/");
    const data = JSON.stringify(doc);
    const docId = SHA1(data).toString();
    return {
      docId,
      remoteResult: Store.dispatchRemote({
        type: "CreateDocAction",
        user: projectIdPaths[0],
        project: projectIdPaths[1],
        data
      })
    };
  }

  static async writeProject(projectId, rootDoc) {
    const projectIdPaths = projectId.split("/");
    const projectName = projectIdPaths[1];
    Store._optimisticProjectRoots[projectId] = rootDoc;
    try {
      await Store.dispatchRemote({
        type: "SetProjectAction",
        rootDoc,
        projectName
      });
    } finally {
      Store._optimisticProjectRoots[projectId] = null;
    }
  }

  static async listenRemote(localId, handler) {
    const localIdParts = localId.split("_");
    const type = localIdParts[0];
    const arg0 = localIdParts[1];
    switch (type) {
      case "Account":
        const session = await Store.getLocal("Session");
        session &&
          Store.sendWebsocketMessage(`ListenAccount_${session.username}`);
        break;
      case "Project":
        Store.sendWebsocketMessage(`ListenProject_${arg0}`);
        break;
      default:
        break;
    }
    const listenerSet =
      Store._listeners[localId] || (Store._listeners[localId] = []);
    listenerSet.push(handler);
  }

  static async sendRemoteListeners() {
    Object.keys(Store._listeners).forEach(async localId => {
      const localIdParts = localId.split("_");
      const type = localIdParts[0];
      const arg0 = localIdParts[1];
      switch (type) {
        case "Account":
          const session = await Store.getLocal("Session");
          session &&
            Store.sendWebsocketMessage(`ListenAccount_${session.username}`);
          break;
        case "Project":
          Store.sendWebsocketMessage(`ListenProject_${arg0}`);
          break;
        default:
          break;
      }
    });
  }

  static async unlisten(name, handler) {
    const localIdParts = name.split("_");
    const type = localIdParts[0];
    const arg0 = localIdParts[1];
    switch (type) {
      case "Account":
        const session = await Store.getLocal("Session");
        session &&
          Store.sendWebsocketMessage(`UnlistenAccount_${session.username}`);
        break;
      case "Project":
        Store.sendWebsocketMessage(`UnlistenProject_${arg0}`);
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
        const projectData = await Store._handleRemoteGet(localId, {
          type: "GetProjectAction",
          user,
          project
        });
        return projectData;
      case "Document":
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
    const project = await Store.get(`Project_${projectId}`);
    if (!project) {
      return project;
    }
    if (Store._optimisticProjectRoots[projectId]) {
      return {
        ...project,
        rootDoc: Store._optimisticProjectRoots[projectId]
      };
    }
    return project;
  }

  static async getProjectRoot(projectId) {
    const project = await Store.getProject(projectId);
    if (!project || !project.rootDoc) {
      return null;
    }
    const rootDoc = await Store.getDocument(projectId, project.rootDoc);
    return rootDoc;
  }

  static async getFolder(projectId, path) {
    // TODO, handle path traversal!!!!
    const folder = await Store.getProjectRoot(projectId);
    if (!folder || folder.type !== "Folder") {
      return null;
    }
    return folder;
  }

  static async getDocument(projectId, docId) {
    if (docId === "null" || !docId) {
      debugger;
    }
    return await Store.get(`Document_${projectId}_${docId}`);
  }

  static async computeDoc(doc, projectId, path, createErrorComponent) {
    let computedDoc = null;
    const deps = {
      ...Store._platformDeps,
      Store
    };
    const remoteDeps = doc.dependencies.filter(
      dep => Store._platformDepNames.indexOf(dep) === -1
    );

    // TODO: process path recursively for dependency resolution!!!!!!
    const ourPath = path.slice(0, path.length - 1);
    const folder = await Store.getFolder(projectId, ourPath);

    const resolvedRemoteDeps = await Promise.all(
      remoteDeps.map(async depName => {
        const depFile = folder.files[depName + ".js.jsmodule"];
        if (depFile && depFile.value) {
          const depDoc = await Store.getDocument(projectId, depFile.value);
          const dep = await Store.computeDoc(depDoc, projectId, [
            ...path,
            depFile.name
          ]);
          return dep;
        }
        return null;
      })
    );
    resolvedRemoteDeps.forEach((dep, depIndex) => {
      const depName = remoteDeps[depIndex];
      deps[depName] = dep;
    });
    try {
      computedDoc = eval(doc.code)(deps);
    } catch (e) {
      return createErrorComponent(e);
    }
    return computedDoc;
  }

  static async getAndListen(localId, handler) {
    await Store.listenRemote(localId, handler);
    const data = await Store.getLocal(localId);
    handler(data);
    // todo, propaer caching somehow lol
    await Store.freshenRemote(localId);
  }
  static async setLocal(localId, data) {
    const storedData = JSON.stringify(data);
    await Store._localStorage.setItem("AvenDocument_" + localId, storedData);
    Store._localDocuments[localId] = data;
    Store.emit(localId, data);
  }
  static async getLocal(localId) {
    let data = Store._localDocuments[localId];
    if (data !== undefined) {
      return data;
    }
    const storedData = await Store._localStorage.getItem(
      "AvenDocument_" + localId
    );
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

  static async dispatchRemote(action) {
    const session = await Store.getLocal("Session");
    const result = await Store.dispatchRemoteWithSession(action, session);
    return result;
  }

  static async dispatchRemoteWithSession(action, session) {
    const { isSecure, host } = session;
    const protocolAndHost = `http${isSecure ? "s" : ""}://${host}`;
    const res = await fetch(`${protocolAndHost}/api/dispatch`, {
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
    console.log(action.type, action, body);
    return body;
  }

  static async login(data) {
    const body = await Store.dispatchRemoteWithSession(
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
      await Store.setLocal("Session", {
        session: body.session,
        username: body.username,
        host: data.host,
        isSecure: data.isSecure
      });
      await Store.attachWebsocket();
      return;
    } else {
      throw "Error on server";
    }
  }

  static async logoutLocal() {
    await Store._localStorage.clear();
    await Store.setLocal("Session", null);
  }

  static async logout() {
    try {
      await Store.dispatchRemote({
        type: "AuthLogoutAction"
      });
    } catch (e) {
      // todo: ask the user if they want to logoutLocal
      await Store.logoutLocal();
      return;
    }
    await Store.logoutLocal();
  }
}

module.exports = Store;
