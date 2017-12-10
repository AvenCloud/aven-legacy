import AuthLogoutAction from "./AuthLogoutAction";
import AuthRegisterAction from "./AuthRegisterAction";
import AuthResetAction from "./AuthResetAction";
import AuthVerifyAction from "./AuthVerifyAction";
import AuthLoginAction from "./AuthLoginAction";
import CreateRecordAction from "./CreateRecordAction";
import GetProfileAction from "./GetProfileAction";
import GetRecordAction from "./GetRecordAction";
import GetDocAction from "./GetDocAction";
import GetAccountAction from "./GetAccountAction";
import PluralAction from "./PluralAction";
import CreateDocAction from "./CreateDocAction";
import SetRecordAction from "./SetRecordAction";

const Actions = {
  PluralAction,
  AuthRegisterAction,
  AuthVerifyAction,
  AuthLoginAction,
  GetAccountAction,
  CreateRecordAction,
  AuthLogoutAction,
  SetRecordAction,
  GetDocAction,
  GetRecordAction,

  CreateDocAction,
  GetProfileAction,
  AuthResetAction,
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