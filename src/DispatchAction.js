import AuthRegisterAction from "./AuthRegisterAction";
import AuthVerifyAction from "./AuthVerifyAction";
import AuthLoginAction from "./AuthLoginAction";
import CreateProjectAction from "./CreateProjectAction";
import EmailRecieveAction from "./EmailRecieveAction";

const Actions = {
  CreateProjectAction,
  EmailRecieveAction,
  AuthRegisterAction,
  AuthLoginAction,
  AuthVerifyAction
};

module.exports = async action => {
  if (Actions[action.type]) {
    return await Actions[action.type](action);
  }

  throw new Error("Action not identified");
};
