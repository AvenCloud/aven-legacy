import DB from "./DB";
import Utilities from "./Utilities";
import DispatchAction from "./DispatchAction";

export default async function AuthLogoutAction(action) {
  if (!action.viewerUser || !action.viewerSession) {
    throw "Invalid session";
  }
  const userData = await DB.getDoc(action.viewerUser);
  if (!userData) {
    throw "Invalid User";
  }
  if (!userData.password) {
    throw "User is not set up yet";
  }
  await DB.writeDoc(action.viewerUser, {
    ...userData,
    sessions: userData.sessions.filter(s => s !== action.viewerSession)
  });
  return {
    username: action.viewerUser
  };
}
