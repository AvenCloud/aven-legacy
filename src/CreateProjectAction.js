import DatabaseService from "./DatabaseService";
import { getAuth } from "./AuthUtilities";
import Utilities from "./Utilities";

export default async function CreateProjectAction(action) {
  console.log("gaaah", action);
  const auth = await getAuth(action.user, action.session);
  console.log("dumm", auth);

  if (!auth) {
    throw "User is not authenticated";
  }

  console.log("authenticated", action);

  return { ok: 1, action };

  // if (!userData) {
  //   throw "Username does not exist. Login with username only right now";
  // }
  // if (!userData.password) {
  //   throw "User is not set up yet";
  // }
  // if (!await Utilities.compareHash(action.password, userData.password)) {
  //   throw "Incorrect password!";
  // }
  // const newSessionId = await Utilities.genSessionId();
  // await DatabaseService.writeDoc(action.username, {
  //   ...userData,
  //   sessions: [...userData.sessions, newSessionId]
  // });
  // return {
  //   username: action.username,
  //   session: newSessionId
  // };
}
