import AuthRegisterAction from "./AuthRegisterAction";
import AuthVerifyAction from "./AuthVerifyAction";

const DataActions = {
  AuthRegisterAction,
  AuthVerifyAction
};

module.exports = async action => {
  if (DataActions[action.type]) {
    return await DataActions[action.type](action);
  }
  throw new Error("Action not identified");
};
