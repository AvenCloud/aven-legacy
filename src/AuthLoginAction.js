import DatabaseService from "./DatabaseService";
import Utilities from "./Utilities";

export default async function AuthLoginAction(action) {
  const userData = await DatabaseService.getDoc(action.username);
  if (!userData) {
    throw "Username does not exist. Login with username only right now";
  }
  if (!userData.password) {
    throw "User is not set up yet";
  }
  if (!await Utilities.compareHash(action.password, userData.password)) {
    throw "Incorrect password!";
  }
  const newSessionId = await Utilities.genSessionId();
  await DatabaseService.writeDoc(action.username, {
    ...userData,
    sessions: [...userData.sessions, newSessionId]
  });
  return {
    username: action.username,
    session: newSessionId
  };
}
