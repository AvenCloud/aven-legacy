const createDispatcher = require("./Dispatch");

const RootAgent = async infra => {
  const recordHandlers = new Map();
  const getRecordHandlers = recordID =>
    recordHandlers.has(recordID)
      ? recordHandlers.get(recordID)
      : recordHandlers.set(recordID, new Set()).get(recordID);
  const subscribe = (recordID, handler) => {
    getRecordHandlers(recordID).add(handler);
  };
  const unsubscribe = (recordID, handler) => {
    getRecordHandlers(recordID).delete(handler);
  };
  const onSetRecord = (recordID, record) => {
    getRecordHandlers(recordID).forEach(handler => handler(record));
  };
  const dispatch = createDispatcher(infra, onSetRecord);

  return {
    close: () => {},
    dispatch,
    subscribe,
    unsubscribe,
  };
};

module.exports = RootAgent;
