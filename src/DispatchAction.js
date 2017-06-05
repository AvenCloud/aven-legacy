import AuthRegisterAction from "./AuthRegisterAction";
import AuthVerifyAction from "./AuthVerifyAction";
import EmailRecieveAction from "./EmailRecieveAction";

const DataActions = {
  EmailRecieveAction,
  AuthRegisterAction,
  AuthVerifyAction
};

module.exports = async action => {
  if (DataActions[action.type]) {
    return await DataActions[action.type](action);
  }
  throw new Error("Action not identified");
};
