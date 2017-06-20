import AuthRegisterAction from "./AuthRegisterAction";
import AuthVerifyAction from "./AuthVerifyAction";
import AuthLoginAction from "./AuthLoginAction";
import CreateProjectAction from "./CreateProjectAction";
import EmailRecieveAction from "./EmailRecieveAction";
import GetProfileAction from "./GetProfileAction";
import GetProjectAction from "./GetProjectAction";
import GetAccountAction from "./GetAccountAction";

const Actions = {
  GetProfileAction,
  GetProjectAction,
  CreateProjectAction,
  EmailRecieveAction,
  AuthRegisterAction,
  AuthLoginAction,
  GetAccountAction,
  AuthVerifyAction
};

module.exports = async action => {
  if (Actions[action.type]) {
    return await Actions[action.type](action);
  }

  throw new Error("Action not identified");
};
