const Actions = {
  AuthRegisterAction: require("./actions/AuthRegisterAction"),
  AuthVerifyAction: require("./actions/AuthVerifyAction")
};

async function Dispatch(action, app) {
  if (Actions[action.type]) {
    const result = await Actions[action.type](action, app, Dispatch);
    return result;
  }
  throw {
    statusCode: 400,
    code: "UNKNOWN_ACTION",
    field: "type",
    message: "This action type is not recognized."
  };
}

module.exports = Dispatch;
