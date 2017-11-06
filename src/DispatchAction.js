import AuthLogoutAction from "./AuthLogoutAction";
import AuthRegisterAction from "./AuthRegisterAction";
import AuthResetAction from "./AuthResetAction";
import AuthVerifyAction from "./AuthVerifyAction";
import AuthLoginAction from "./AuthLoginAction";
import CreateProjectAction from "./CreateProjectAction";
import EmailRecieveAction from "./EmailRecieveAction";
import GetProfileAction from "./GetProfileAction";
import GetProjectAction from "./GetProjectAction";
import GetDocAction from "./GetDocAction";
import GetAccountAction from "./GetAccountAction";
import PluralAction from "./PluralAction";
import CreateDocAction from "./CreateDocAction";
import SetProjectAction from "./SetProjectAction";

const Actions = {
  CreateDocAction,
  GetProfileAction,
  GetProjectAction,
  GetDocAction,
  CreateProjectAction,
  EmailRecieveAction,
  AuthRegisterAction,
  AuthResetAction,
  AuthLoginAction,
  AuthLogoutAction,
  GetAccountAction,
  PluralAction,
  AuthVerifyAction,
  SetProjectAction
};

async function Dispatcher(action) {
  if (Actions[action.type]) {
    const result = await Actions[action.type](action, Dispatcher);
    return result;
  }
  console.log("Unknown action:" + JSON.stringify(action));
  throw new Error("Action not identified");
}

module.exports = Dispatcher;
