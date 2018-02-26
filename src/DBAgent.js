const DBActions = {
  AuthRegisterAction: require("./DBAgentActions/AuthRegisterAction"),
  AuthVerifyAction: require("./DBAgentActions/AuthVerifyAction"),
  AuthLoginAction: require("./DBAgentActions/AuthLoginAction"),
  AuthLogoutAction: require("./DBAgentActions/AuthLogoutAction"),
  SetRecordAction: require("./DBAgentActions/SetRecordAction"),
  GetRecordAction: require("./DBAgentActions/GetRecordAction"),
  CreateDocAction: require("./DBAgentActions/CreateDocAction"),
  GetDocAction: require("./DBAgentActions/GetDocAction"),
  GetPermissionAction: require("./DBAgentActions/GetPermissionAction"),
  SetPermissionAction: require("./DBAgentActions/SetPermissionAction"),
  GetSessionAction: require("./DBAgentActions/GetSessionAction"),
};

const DBAgent = async infra => {
  const recordHandlers = new Map();
  // todo, pubsub with postgres to observe record changes from other processes
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
  async function dispatch(action) {
    if (DBActions[action.type]) {
      try {
        const result = await DBActions[action.type](
          action,
          infra,
          onSetRecord,
          dispatch,
        );
        return result;
      } catch (e) {
        throw {
          code: e.code,
          message: e.message,
          statusCode: e.statusCode,
          // action, // Useful for debugging but would leak secrets in prod
          error: e,
        };
      }
    }
    throw {
      statusCode: 400,
      code: "UNKNOWN_ACTION",
      field: "type",
      message: "This action type is not recognized.",
    };
  }

  Object.keys(DBActions).forEach(actionName => {
    dispatch[actionName] = action =>
      dispatch({
        ...action,
        type: actionName,
      });
  });
  const env = await infra.getPublicDebugInfo();
  return {
    env,
    close: () => {},
    dispatch,
    subscribe,
    unsubscribe,
    infra,
  };
};

module.exports = DBAgent;
