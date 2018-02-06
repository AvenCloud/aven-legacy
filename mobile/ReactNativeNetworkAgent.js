import { NetInfo } from "react-native";

const ReactNativeNetworkAgent = async ({ useSSL, host }) => {
  let _isOnline = false;
  let _isWsConnected = false;

  const conn = await NetInfo.getConnectionInfo();
  _updateIsOnline(conn);
  NetInfo.addEventListener("connectionChange", _onConnectionChange);

  async function _onConnectionChange(conn) {
    _updateIsOnline(conn);
  }

  _statusHandlers = new Set();
  async function getStatus() {
    return {
      isOnline: _isOnline,
      isConnected: _isWsConnected,
    };
  }
  async function onStatus(handler) {
    const status = await getStatus();
    _statusHandlers.add(handler);
    handler(status);
  }
  async function offStatus(handler) {
    _statusHandlers.delete(handler);
  }
  async function _updateIsOnline(conn) {
    const isOnline = conn.type === "wifi" || conn.type === "cellular";
    const wasOnline = _isOnline;
    if (isOnline !== _isOnline) {
      _isOnline = isOnline;
      _emitStatusChange();
    }
    if (!wasOnline && isOnline) {
      console.log("Just came on line!");
      attachWebsocket();
    } else if (!isOnline && wasOnline) {
      detachWebsocket();
    }
  }

  async function _emitStatusChange() {
    const status = await getStatus();
    _statusHandlers.forEach(handler => handler(status));
  }

  let _ws;

  async function detachWebsocket() {
    if (_ws) {
      _ws.close();
    }
    _ws = null;
    _isWsConnected = false;
    _emitStatusChange();
  }
  async function attachWebsocket() {
    await detachWebsocket();
    const protocolAndHost = `ws${useSSL ? "s" : ""}://${host}`;
    console.log("Connecting to ", protocolAndHost);
    _ws = new WebSocket(protocolAndHost);
    _ws.onopen = _onWebsocketOpen;
    _ws.onclose = _onWebsocketClose;
    _ws.onerror = _onWebsocketClose;
    _ws.onmessage = _onWebsocketMessage;
  }

  const _onWebsocketOpen = () => {
    console.log("Websocket connected!");
    _isWsConnected = true;
    _emitStatusChange();
    _upstreamSubscribedRecords.forEach(recordID => {
      sendWebsocketMessage({ type: "subscribe", recordID });
    });
  };

  const _upstreamSubscribedRecords = new Set();

  const sendWebsocketMessage = message => {
    if (_ws && _isWsConnected && _ws.readyState === 1) {
      _ws.send(JSON.stringify(message));
    } else {
      console.log("not ready to send:", message);
    }
  };

  const _onWebsocketMessage = async e => {
    const payload = JSON.parse(e.data);
    console.log("dd", payload);
    if (payload.recordID && payload.docID) {
      _deliverRecord(payload);
    }
  };

  const _onWebsocketError = e => {
    detachWebsocket();
    console.log("Connection Errored", e.code, e.reason);
  };
  let _reconnectTimeout = null;
  const _onWebsocketClose = e => {
    detachWebsocket();
    console.log("Connection Closed", e.code, e.reason);

    // we assume accidental disconnection. Wait 5 seconds and retry
    clearTimeout(_reconnectTimeout);
    _reconnectTimeout = setTimeout(() => {
      if (_isOnline && !_isWsConnected) {
        attachWebsocket();
      }
    }, 5000);
  };

  async function dispatch(action) {
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
  }

  const _recordHandlers = new Map();
  _getRecordHandlerSet = recordID =>
    _recordHandlers.has(recordID)
      ? _recordHandlers.get(recordID)
      : _recordHandlers.set(recordID, new Set()).get(recordID);

  async function _subscribeToUpstreamRecord(recordID) {
    if (!_upstreamSubscribedRecords.has(recordID)) {
      _upstreamSubscribedRecords.add(recordID);
      sendWebsocketMessage({ type: "subscribe", recordID });
      console.log("send subs", recordID);
    }
  }
  async function _unsubscribeToUpstreamRecord(recordID) {
    const recordHandlers = _getRecordHandlerSet(recordID);
    const docHandlers = _getRecordDocHandlerSet(recordID);
    if (recordHandlers.size === 0 || docHandlers.size === 0) {
      _upstreamSubscribedRecords.delete(recordID);
      sendWebsocketMessage({ type: "unsubscribe", recordID });
      console.log("send unsubs", recordID);
    }
  }

  async function _deliverRecord(record) {
    const handlers = _getRecordHandlerSet(record.recordID);
    handlers.forEach(handler => handler(record));
  }
  async function subscribe(recordID, handler) {
    console.log("subs", recordID);
    _getRecordHandlerSet(recordID).add(handler);
    await _subscribeToUpstreamRecord(recordID);
  }
  function unsubscribe(recordID, handler) {
    console.log("unsubs", recordID);
    _getRecordHandlerSet(recordID).remove(handler);
    _unsubscribeToUpstreamRecord(recordID);
  }
  return {
    dispatch,
    subscribe,
    unsubscribe,
    onStatus,
  };

  // // Record:

  // async getRecord(recordID) {
  //   const record = await this._dispatch({
  //     type: "GetRecordAction",
  //     recordID,
  //   });
  //   return record;
  // }
  // _recordHandlers = new Map();
  // _getRecordHandlerSet = recordID =>
  //   this._recordHandlers.has(recordID)
  //     ? this._recordHandlers.get(recordID)
  //     : this._recordHandlers.set(recordID, new Set()).get(recordID);
  // async onRecord(recordID, handler) {
  //   await this._subscribeToUpstreamRecord(recordID);
  //   const record = await this.getRecord(recordID);
  //   this._getRecordHandlerSet(recordID).add(handler);
  //   handler(record);
  // }
  // async offRecord(recordID, handler) {
  //   this._getRecordHandlerSet(recordID).remove(handler);
  //   this._unsubscribeToUpstreamRecord(recordID);
  // }
  // async _subscribeToUpstreamRecord(recordID) {
  //   if (!this._upstreamSubscribedRecords.has(recordID)) {
  //     this._upstreamSubscribedRecords.add(recordID);
  //     this.sendWebsocketMessage({ type: "subscribe", recordID });
  //   }
  // }
  // async _unsubscribeToUpstreamRecord(recordID) {
  //   const recordHandlers = this._getRecordHandlerSet(recordID);
  //   const docHandlers = this._getRecordDocHandlerSet(recordID);
  //   if (recordHandlers.size === 0 || docHandlers.size === 0) {
  //     this._upstreamSubscribedRecords.delete(recordID);
  //     this.sendWebsocketMessage({ type: "unsubscribe", recordID });
  //   }
  // }

  // // Doc:

  // async getDoc(recordID, docID) {
  //   const doc = await this._dispatch({
  //     type: "GetDocAction",
  //     docID,
  //     recordID,
  //   });
  //   return doc;
  // }

  // // RecordDoc

  // async getRecordDoc(recordID) {
  //   const record = await this.getRecord(recordID);
  //   if (record && record.docID) {
  //     const doc = await this.getDoc(recordID, record.docID);
  //     return { ...record, value: doc.value };
  //   }
  //   return record;
  // }
  // _recordDocHandlers = new Map();
  // _getRecordDocHandlerSet = recordID =>
  //   this._recordDocHandlers.has(recordID)
  //     ? this._recordDocHandlers.get(recordID)
  //     : this._recordDocHandlers.set(recordID, new Set()).get(recordID);
  // async onRecordDoc(recordID, handler) {
  //   await this._subscribeToUpstreamRecord(recordID);
  //   const recordDoc = await this.getRecordDoc(recordID);
  //   this._getRecordDocHandlerSet(recordID).add(handler);
  //   handler(recordDoc);
  // }
  // async _deliverRecord(record) {
  //   const handlers = this._getRecordHandlerSet(record.recordID);
  //   handlers.forEach(handler => handler(record));
  //   const docHandlers = this._getRecordDocHandlerSet(record.recordID);
  //   if (docHandlers && docHandlers.size) {
  //     const doc = await this.getDoc(record.recordID, record.docID);
  //     const docRecord = { ...record, value: doc.value };
  //     docHandlers.forEach(handler => handler(docRecord));
  //   }
  // }
  // async offRecordDoc(recordID, handler) {
  //   this._getRecordDocHandlerSet(recordID).remove(handler);
  //   this._unsubscribeToUpstreamRecord(recordID);
  // }

  // getExecRecord(recordID) {}
  // onExecRecord(recordID) {}
  // offExecRecord(recordID) {}

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
};

module.exports = ReactNativeNetworkAgent;

// Aven Agent Architecture
//# Every Agent exports dispatch,subs,unsubs

// const ServerAgent => (infra) => {
//   connection {
//     dispatch
//     subscribe
//     unsubscribe
//   }
// }

// const ClientNetworkAgent => (host, useSSL) => {
//   connection {
//     dispatch
//     subscribe
//     unsubscribe
//   }
// }

// const ClientAgent => (conn, localStorage?) => {
//   ...exec,
//   ...various helpers...

//   connection {
//     dispatch
//     subscribe
//     unsubscribe
//   }
// }
