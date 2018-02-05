const Actions = {
  AuthRegisterAction: require("./actions/AuthRegisterAction"),
  AuthVerifyAction: require("./actions/AuthVerifyAction"),
  AuthLoginAction: require("./actions/AuthLoginAction"),
  AuthLogoutAction: require("./actions/AuthLogoutAction"),
  SetRecordAction: require("./actions/SetRecordAction"),
  GetRecordAction: require("./actions/GetRecordAction"),
  CreateDocAction: require("./actions/CreateDocAction"),
  GetDocAction: require("./actions/GetDocAction"),
};

function createDispatcher(infra) {
  async function dispatch(action) {
    if (Actions[action.type]) {
      const result = await Actions[action.type](action, infra);
      return result;
    }
    throw {
      statusCode: 400,
      code: "UNKNOWN_ACTION",
      field: "type",
      message: "This action type is not recognized.",
    };
  }

  Object.keys(Actions).forEach(actionName => {
    dispatch[actionName] = action =>
      dispatch({
        ...action,
        type: actionName,
      });
  });

  return dispatch;
}

module.exports = createDispatcher;
