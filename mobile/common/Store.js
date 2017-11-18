const SHA1 = require("crypto-js/sha1");
const Hex = require("crypto-js/format-hex");

class Store {
  _localDocuments = {};
  _listeners = {};
  _isWsConnected = false;
  _ws = null;
  _localStorage = null;
  _remoteActionRequests = [];
  _publishedDocuments = [];
  _optimisticProjectRoots = {};

  init = ({ localStorage, platformDeps }) => {
    this._localStorage = localStorage;
    this.attachWebsocket();
    this._platformDeps = platformDeps;
    this._platformDepNames = Object.keys(platformDeps);
  };

  _onWebsocketOpen = () => {
    console.log("Websocket connected!");
    this.sendRemoteListeners();
    this._isWsConnected = true;
    this._queuedWsMessages.map(this.sendWebsocketMessage);
    this._queuedWsMessages = [];
  };

  _onWebsocketMessage = async e => {
    const msgParts = e.data.split("_");
    const type = msgParts[0];
    const name = msgParts[1];
    const value = msgParts[2];
    switch (type) {
      case "PublishAccount":
        this.freshenRemote("Account");
        return;
      case "PublishProject":
        const project = await this.getLocal(`Project_${name}`);
        if (!project) {
          return;
        }
        this.setLocal(`Project_${name}`, {
          ...project,
          rootDoc: value
        });
        return;
    }
  };

  _onWebsocketClose = e => {
    this.detachWebsocket();
    console.log("Connection Closed or Errored", e.code, e.reason);

    // we assume this diconnection. Wait a bit and retry
    setTimeout(() => {
      this.attachWebsocket();
    }, 10000);
  };

  attachWebsocket = async () => {
    await this.detachWebsocket();
    const session = await this.getLocal("Session");
    if (!session) {
      return;
    }
    const { isSecure, host } = session;
    const protocolAndHost = `ws${isSecure ? "s" : ""}://${host}`;
    console.log("Connecting to ", protocolAndHost, session);
    this._ws = new WebSocket(protocolAndHost);
    this._ws.onopen = this._onWebsocketOpen;
    this._ws.onclose = this._onWebsocketClose;
    this._ws.onerror = this._onWebsocketClose;
    this._ws.onmessage = this._onWebsocketMessage;
  };

  detachWebsocket = async () => {
    if (this._ws) {
      this._ws.close();
    }
    this._ws = null;
    this._isWsConnected = false;
  };

  _queuedWsMessages = [];
  sendWebsocketMessage = message => {
    if (this._ws && this._isWsConnected) {
      // So, the ws library fails if the ready state is 'connecting'
      if (this._ws.readyState === 1) {
        this._ws.send(message);
      }
    } else {
      this._queuedWsMessages.push(message);
    }
  };

  emit(name, data) {
    const listenerSet = this._listeners[name] || (this._listeners[name] = []);
    listenerSet.forEach(listener => {
      listener(data);
    });
  }

  async writeProjectFile(data, projectId, path) {
    const project = await this.getProject(projectId);
    const { docId } = await this.writeDocument(data, projectId);
    const newRootDoc = await this.writeInFolder(
      projectId,
      project.rootDoc,
      path,
      docId
    );
    await this.writeProject(projectId, newRootDoc);
  }

  async writeInFolder(projectId, lastId, path, newFileValue) {
    const lastFolder = lastId && (await this.getDocument(projectId, lastId));
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
    const { docId } = await this.writeDocument({ ...folder, files }, projectId);
    return docId;
  }

  async writeDocument(doc, projectId) {
    const projectIdPaths = projectId.split("/");
    const data = JSON.stringify(doc);
    const docId = SHA1(data).toString();
    return {
      docId,
      remoteResult: this.dispatchRemote({
        type: "CreateDocAction",
        user: projectIdPaths[0],
        project: projectIdPaths[1],
        data
      })
    };
  }

  async writeProject(projectId, rootDoc) {
    const projectIdPaths = projectId.split("/");
    const projectName = projectIdPaths[1];
    this._optimisticProjectRoots[projectId] = rootDoc;
    try {
      await this.dispatchRemote({
        type: "SetProjectAction",
        rootDoc,
        projectName
      });
    } finally {
      this._optimisticProjectRoots[projectId] = null;
    }
  }

  async listenRemote(localId, handler) {
    const localIdParts = localId.split("_");
    const type = localIdParts[0];
    const arg0 = localIdParts[1];
    switch (type) {
      case "Account":
        const session = await this.getLocal("Session");
        session &&
          this.sendWebsocketMessage(`ListenAccount_${session.username}`);
        break;
      case "Project":
        this.sendWebsocketMessage(`ListenProject_${arg0}`);
        break;
      default:
        break;
    }
    const listenerSet =
      this._listeners[localId] || (this._listeners[localId] = []);
    listenerSet.push(handler);
  }

  async sendRemoteListeners() {
    Object.keys(this._listeners).forEach(async localId => {
      const localIdParts = localId.split("_");
      const type = localIdParts[0];
      const arg0 = localIdParts[1];
      switch (type) {
        case "Account":
          const session = await this.getLocal("Session");
          session &&
            this.sendWebsocketMessage(`ListenAccount_${session.username}`);
          break;
        case "Project":
          this.sendWebsocketMessage(`ListenProject_${arg0}`);
          break;
        default:
          break;
      }
    });
  }

  async unlisten(name, handler) {
    const localIdParts = name.split("_");
    const type = localIdParts[0];
    const arg0 = localIdParts[1];
    switch (type) {
      case "Account":
        const session = await this.getLocal("Session");
        session &&
          this.sendWebsocketMessage(`UnlistenAccount_${session.username}`);
        break;
      case "Project":
        this.sendWebsocketMessage(`UnlistenProject_${arg0}`);
        break;
      default:
        break;
    }

    const listenerSet = this._listeners[name] || (this._listeners[name] = []);
    const listenerIndex = listenerSet.indexOf(handler);
    if (listenerIndex !== -1) {
      listenerSet.splice(listenerIndex, 1);
    }
  }

  async _handleRemoteGet(localId, action) {
    const remoteDoc = await this.dispatchRemote(action);
    await this.setLocal(localId, remoteDoc);
    return remoteDoc;
  }

  async freshenRemote(localId) {
    const localIdParts = localId.split("_");
    const type = localIdParts[0];
    const projectId = localIdParts[1];
    const user = projectId && projectId.split("/")[0];
    const project = projectId && projectId.split("/")[1];
    const id = localIdParts[2];
    switch (type) {
      case "Account":
        return this._handleRemoteGet(localId, {
          type: "GetAccountAction"
        });
      case "Profile":
        return this._handleRemoteGet(localId, {
          type: "GetProfileAction",
          user: projectId
        });
      case "Project":
        const projectData = await this._handleRemoteGet(localId, {
          type: "GetProjectAction",
          user,
          project
        });
        return projectData;
      case "Document":
        // document IDs are immutable (content-addressable), so we don't need to load them remotely if we have them here
        const localDoc = await this.getLocal(localId);
        if (localDoc) {
          return localDoc;
        }
        return this._handleRemoteGet(localId, {
          type: "GetDocAction",
          user,
          project,
          id
        });
      default:
        return undefined;
    }
  }

  async getAccount() {
    return this.get("Account");
  }

  async getProfile(userId) {
    return this.get("Profile_" + userId);
  }

  async get(localId) {
    await this.freshenRemote(localId);
    return await this.getLocal(localId);
  }

  async getProject(projectId) {
    const project = await this.get(`Project_${projectId}`);
    if (!project) {
      return project;
    }
    if (this._optimisticProjectRoots[projectId]) {
      return {
        ...project,
        rootDoc: this._optimisticProjectRoots[projectId]
      };
    }
    return project;
  }

  async getProjectRoot(projectId) {
    const project = await this.getProject(projectId);
    if (!project || !project.rootDoc) {
      return null;
    }
    const rootDoc = await this.getDocument(projectId, project.rootDoc);
    return rootDoc;
  }

  async getFolder(projectId, path) {
    // TODO, handle path traversal!!!!
    const folder = await this.getProjectRoot(projectId);
    if (!folder || folder.type !== "Folder") {
      return null;
    }
    return folder;
  }

  async getDocument(projectId, docId) {
    if (docId === "null" || !docId) {
      debugger;
    }
    return await this.get(`Document_${projectId}_${docId}`);
  }

  async computeDoc(doc, projectId, path, createErrorComponent) {
    let computedDoc = null;
    const deps = {
      ...this._platformDeps,
      Store
    };
    const remoteDeps = doc.dependencies.filter(
      dep => this._platformDepNames.indexOf(dep) === -1
    );

    // TODO: process path recursively for dependency resolution!!!!!!
    const ourPath = path.slice(0, path.length - 1);
    const folder = await this.getFolder(projectId, ourPath);

    const resolvedRemoteDeps = await Promise.all(
      remoteDeps.map(async depName => {
        const depFile = folder.files[depName + ".js.jsmodule"];
        if (depFile && depFile.value) {
          const depDoc = await this.getDocument(projectId, depFile.value);
          const dep = await this.computeDoc(depDoc, projectId, [
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

  async getAndListen(localId, handler) {
    await this.listenRemote(localId, handler);
    const data = await this.getLocal(localId);
    handler(data);
    // todo, propaer caching somehow lol
    await this.freshenRemote(localId);
  }
  async setLocal(localId, data) {
    const storedData = JSON.stringify(data);
    await this._localStorage.setItem("AvenDocument_" + localId, storedData);
    this._localDocuments[localId] = data;
    this.emit(localId, data);
  }
  async getLocal(localId) {
    let data = this._localDocuments[localId];
    if (data !== undefined) {
      return data;
    }
    const storedData = await this._localStorage.getItem(
      "AvenDocument_" + localId
    );
    if (storedData) {
      try {
        data = JSON.parse(storedData);
      } catch (e) {
        data = storedData;
      }
    }
    this._localDocuments[localId] = data;
    return data;
  }

  async dispatchRemote(action) {
    const session = await this.getLocal("Session");
    const result = await this.dispatchRemoteWithSession(action, session);
    return result;
  }

  async dispatchRemoteWithSession(action, session) {
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

  async login(data) {
    const body = await this.dispatchRemoteWithSession(
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
      await this.setLocal("Session", {
        session: body.session,
        username: body.username,
        host: data.host,
        isSecure: data.isSecure
      });
      await this.attachWebsocket();
      return;
    } else {
      throw "Error on server";
    }
  }

  async logoutLocal() {
    await this._localStorage.clear();
    await this.setLocal("Session", null);
  }

  async logout() {
    try {
      await this.dispatchRemote({
        type: "AuthLogoutAction"
      });
    } catch (e) {
      // todo: ask the user if they want to logoutLocal
      await this.logoutLocal();
      return;
    }
    await this.logoutLocal();
  }
}

module.exports = Store;
