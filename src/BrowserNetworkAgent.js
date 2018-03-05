import { NetInfo } from "react-native-web";

// heads up, this file was mostly copy-pasted from ReactNativeNetworkAgent

const BroserNetworkAgent = async () => {
  const env = window.avenEnv;

  const useSSL = env.useSSL || false;
  const host = env.host || "localhost:3000";

  let _isOnline = false;
  let _isWsConnected = false;

  const conn = await NetInfo.getConnectionInfo();
  _updateIsOnline(conn);
  NetInfo.addEventListener("connectionChange", _onConnectionChange);

  async function _onConnectionChange(conn) {
    _updateIsOnline(conn);
  }

  const _statusHandlers = new Set();
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
    // const isOnline = conn.type === "wifi" || conn.type === "cellular";
    const isOnline = true; // temporary measure on web
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
  const _getRecordHandlerSet = recordID =>
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
    getEnv: () => env,
    dispatch,
    subscribe,
    unsubscribe,
    onStatus,
  };
};

module.exports = BroserNetworkAgent;
