const Actions = {
  AuthRegisterAction: require("./actions/AuthRegisterAction"),
  AuthVerifyAction: require("./actions/AuthVerifyAction"),
  AuthLoginAction: require("./actions/AuthLoginAction"),
  AuthLogoutAction: require("./actions/AuthLogoutAction"),
  SetRecordAction: require("./actions/SetRecordAction"),
  GetRecordAction: require("./actions/GetRecordAction"),
  CreateDocAction: require("./actions/CreateDocAction"),
  GetDocAction: require("./actions/GetDocAction"),
}

async function Dispatch(action, app) {
  if (Actions[action.type]) {
    const result = await Actions[action.type](action, app)
    return result
  }
  throw {
    statusCode: 400,
    code: "UNKNOWN_ACTION",
    field: "type",
    message: "This action type is not recognized.",
  }
}

module.exports = Dispatch