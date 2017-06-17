import DatabaseService from "./DatabaseService";
import { getAuth } from "./AuthUtilities";
import Utilities from "./Utilities";

export default async function CreateProjectAction(action) {
  const auth = await getAuth(action.user, action.session);
  if (!auth) {
    throw "User is not authenticated";
  }
  const lastUserDoc = await DatabaseService.getDoc(action.user);
  const projects = lastUserDoc.projects ? lastUserDoc.projects.slice() : [];
  projects.push(action.projectName);
  await DatabaseService.writeDoc(action.user, { ...lastUserDoc, projects });
  await DatabaseService.writeDoc(action.user + "/" + action.projectName, {
    name: action.projectName
  });
  return { newProject: action.projectName };

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
