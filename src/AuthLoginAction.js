import DB from "./DB";
import Utilities from "./Utilities";

export default async function AuthLoginAction(action) {
  const user = await DB.Model.User.findOne({
    where: {
      id: action.user
    }
  });
  const authMethod = await DB.Model.AuthenticationMethod.findOne({
    where: {
      primaryOwner: action.user
    }
  });
  if (!user || !authMethod) {
    throw "User does not exist.";
  }
  if (authMethod.verificationKey) {
    throw "User has not verified account.";
  }
  if (!await Utilities.compareHash(action.password, user.password)) {
    throw "Incorrect password!";
  }
  const sessionId = await Utilities.genSessionId();
  const sessionSecret = await Utilities.genSessionId();
  const logoutToken = await Utilities.genSessionId();
  await DB.Model.UserSession.create({
    id: sessionId,
    user: user.id,
    secret: await Utilities.genHash(sessionSecret),
    logoutToken: await Utilities.genHash(logoutToken),
    ip: '0.0.0.0', // uhhh, actually implement this
    authMethod: authMethod.id,
  });
  return {
    username: action.username,
    session: sessionId + '-' + sessionSecret,
    logoutToken: sessionId + '-' + sessionSecret,
  };
}