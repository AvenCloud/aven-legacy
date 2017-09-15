import AuthRegisterAction from "./AuthRegisterAction";
import AuthResetAction from "./AuthResetAction";
import AuthVerifyAction from "./AuthVerifyAction";
import AuthLoginAction from "./AuthLoginAction";
import CreateProjectAction from "./CreateProjectAction";
import EmailRecieveAction from "./EmailRecieveAction";
import GetProfileAction from "./GetProfileAction";
import GetProjectAction from "./GetProjectAction";
import GetAccountAction from "./GetAccountAction";
import CreateDocAction from "./CreateDocAction";
import SetProjectAction from "./SetProjectAction";

const Actions = {
  CreateDocAction,
  GetProfileAction,
  GetProjectAction,
  CreateProjectAction,
  EmailRecieveAction,
  AuthRegisterAction,
  AuthResetAction,
  AuthLoginAction,
  GetAccountAction,
  AuthVerifyAction,
  SetProjectAction
};

async function Dispatcher(action) {
  if (Actions[action.type]) {
    return await Actions[action.type](action, Dispatcher);
  }
  console.log("Unknown action:" + JSON.stringify(action));
  throw new Error("Action not identified");
}

module.exports = Dispatcher;
