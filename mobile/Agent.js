import { NetInfo } from "react-native";

export class ReactNativeAgent {
  constructor(options) {
    const { upstream } = options;
    this._upstream = upstream;
  }

  _isOnline = false;
  _isWsConnected = false;

  async connect() {
    const conn = await NetInfo.getConnectionInfo();
    this._updateIsOnline(conn);
    NetInfo.addEventListener("connectionChange", this._onConnectionChange);
  }

  _onConnectionChange = conn => {
    this._updateIsOnline(conn);
  };

  _statusHandlers = new Set();
  async getStatus() {
    return {
      isOnline: this._isOnline,
      isConnected: this._isWsConnected,
    };
  }
  async onStatus(handler) {
    const status = await this.getStatus();
    this._statusHandlers.add(handler);
    handler(status);
  }
  async offStatus(handler) {
    this._statusHandlers.delete(handler);
  }
  async _updateIsOnline(conn) {
    const isOnline = conn.type === "wifi" || conn.type === "cellular";
    const wasOnline = this._isOnline;
    if (isOnline !== this._isOnline) {
      this._isOnline = isOnline;
      this._emitStatusChange();
    }
    if (!wasOnline && isOnline) {
      console.log("Just came on line!");
      this.attachWebsocket();
    } else if (!isOnline && wasOnline) {
      this.detachWebsocket();
    }
  }

  _emitStatusChange = async () => {
    const status = await this.getStatus();
    this._statusHandlers.forEach(handler => handler(status));
  };

  detachWebsocket = async () => {
    if (this._ws) {
      this._ws.close();
    }
    this._ws = null;
    this._isWsConnected = false;
    this._emitStatusChange();
  };
  attachWebsocket = async () => {
    await this.detachWebsocket();
    const { useSSL, host } = this._upstream;
    const protocolAndHost = `ws${useSSL ? "s" : ""}://${host}`;
    console.log("Connecting to ", protocolAndHost);
    this._ws = new WebSocket(protocolAndHost);
    this._ws.onopen = this._onWebsocketOpen;
    this._ws.onclose = this._onWebsocketClose;
    this._ws.onerror = this._onWebsocketClose;
    this._ws.onmessage = this._onWebsocketMessage;
  };

  _onWebsocketOpen = () => {
    console.log("Websocket connected!");
    this._isWsConnected = true;
    this._emitStatusChange();
    this._upstreamSubscribedRecords.forEach(recordID => {
      this.sendWebsocketMessage({ type: "subscribe", recordID });
    });
  };

  _upstreamSubscribedRecords = new Set();

  sendWebsocketMessage = message => {
    if (this._ws && this._isWsConnected && this._ws.readyState === 1) {
      this._ws.send(JSON.stringify(message));
    } else {
      console.log("not ready to send:", message);
    }
  };

  _onWebsocketMessage = async e => {
    const payload = JSON.parse(e.data);
    if (payload.recordID && payload.docID) {
      this._deliverRecord(payload);
    }
  };

  _onWebsocketError = e => {
    this.detachWebsocket();
    console.log("Connection Errored", e.code, e.reason);
  };
  _onWebsocketClose = e => {
    this.detachWebsocket();
    console.log("Connection Closed", e.code, e.reason);

    // we assume accidental disconnection. Wait 5 seconds and retry
    setTimeout(() => {
      if (this._isOnline && !this._isWsConnected) {
        this.attachWebsocket();
      }
    }, 5000);
  };

  async authRegister({ userName }) {}

  async disconnect() {}

  _dispatch = async action => {
    const { useSSL, host } = this._upstream;
    const protocolAndHost = `http${useSSL ? "s" : ""}://${host}`;
    const res = await fetch(`${protocolAndHost}/api/dispatch`, {
      method: "post",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(action),
    });
    const textBody = await res.text();
    let body = textBody;
    try {
      body = textBody && JSON.parse(textBody);
    } catch (e) {}
    console.log(action.type, action, body);
    return body;
  };

  // Record:

  async getRecord(recordID) {
    const record = await this._dispatch({
      type: "GetRecordAction",
      recordID,
    });
    return record;
  }
  _recordHandlers = new Map();
  _getRecordHandlerSet = recordID =>
    this._recordHandlers.has(recordID)
      ? this._recordHandlers.get(recordID)
      : this._recordHandlers.set(recordID, new Set()).get(recordID);
  async onRecord(recordID, handler) {
    this._subscribeToUpstreamRecord(recordID);

    const record = await this.getRecord(recordID);
    this._getRecordHandlerSet(recordID).add(handler);
    handler(record);
  }
  async offRecord(recordID, handler) {
    this._getRecordHandlerSet(recordID).remove(handler);
    this._unsubscribeToUpstreamRecord(recordID);
  }
  async _subscribeToUpstreamRecord(recordID) {
    if (!this._upstreamSubscribedRecords.has(recordID)) {
      this._upstreamSubscribedRecords.add(recordID);
      this.sendWebsocketMessage({ type: "subscribe", recordID });
    }
  }
  async _unsubscribeToUpstreamRecord(recordID) {
    const recordHandlers = this._getRecordHandlerSet(recordID);
    const docHandlers = this._getRecordDocHandlerSet(recordID);
    if (recordHandlers.size === 0 || docHandlers.size === 0) {
      this._upstreamSubscribedRecords.delete(recordID);
      this.sendWebsocketMessage({ type: "unsubscribe", recordID });
    }
  }

  // Doc:

  async getDoc(recordID, docID) {
    const doc = await this._dispatch({
      type: "GetDocAction",
      docID,
      recordID,
    });
    return doc;
  }

  // RecordDoc

  async getRecordDoc(recordID) {
    const record = await this.getRecord(recordID);
    if (record && record.docID) {
      const doc = await this.getDoc(recordID, record.docID);
      return { ...record, value: doc.value };
    }
    return record;
  }
  _recordDocHandlers = new Map();
  _getRecordDocHandlerSet = recordID =>
    this._recordDocHandlers.has(recordID)
      ? this._recordDocHandlers.get(recordID)
      : this._recordDocHandlers.set(recordID, new Set()).get(recordID);
  async onRecordDoc(recordID, handler) {
    this._subscribeToUpstreamRecord(recordID);
    const recordDoc = await this.getRecordDoc(recordID);
    this._getRecordDocHandlerSet(recordID).add(handler);
    handler(recordDoc);
  }
  async _deliverRecord(record) {
    const handlers = this._getRecordHandlerSet(record.recordID);
    handlers.forEach(handler => handler(record));
    const docHandlers = this._getRecordDocHandlerSet(record.recordID);
    if (docHandlers && docHandlers.size) {
      const doc = await this.getDoc(record.recordID, record.docID);
      const docRecord = { ...record, value: doc.value };
      docHandlers.forEach(handler => handler(docRecord));
    }
  }
  async offRecordDoc(recordID, handler) {
    this._getRecordDocHandlerSet(recordID).remove(handler);
    this._unsubscribeToUpstreamRecord(recordID);
  }

  getExecRecord(recordID) {}
  onExecRecord(recordID) {}
  offExecRecord(recordID) {}

  // agent.connect(); // may result in status change
  // agent.disconnect(); // may result in status change

  // agent.onStatus(handler);
  //   // status = { isConnected, isLoading, authUser, }
  // agent.onRecord(recordID, handler);
  //   // record = {doc, readAccess: true|falsy|Array<userID> writeAccess: true|falsy|Array<userID>, executeAccess: ... adminAccess: falsy|Array<userID>, owner, updateTime, creationTime }
  // agent.setRecord(recordID, fullRecordObj);
  //   //
  // agent.onDoc(recordID, docID, handler);
  //   // {docID, recordID, value}
  // agent.publishDoc(recordID, value);
  //   // {docID, recordID, value}
  // agent.publishRecord(recordID, value);
  //   // record = {recordID, docID, readAccess: true|falsy|Array<userID> writeAccess: true|falsy|Array<userID>, executeAccess: ... adminAccess: falsy|Array<userID>, owner, updateTime, creationTime }

  // agent.execDoc()
  // agent.execRecord('App')
  // agent.onUser(userName, handler)
  // agent.onSelfUser(handler)
  //   // user = displayName, id,
  //   // if logged in: moreshit
  // agent.authSetUser();

  // agent.authRegister();
  // agent.authLogin();
  // agent.authVerify();

  // agent.off*(...)
}
