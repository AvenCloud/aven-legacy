import DB from "./DB";
import { getAuth } from "./AuthUtilities";
import Utilities from "./Utilities";

export default async function CreateDocAction(action) {
  const auth = await getAuth(action.viewerUser, action.viewerSession);
  if (!auth) {
    throw "User is not authenticated";
  }
  if (action.viewerUser !== action.user) {
    throw "User is not authenticated";
  }
  const userDoc = await DB.getDoc(action.user);
  const projectNames = Object.keys(userDoc.projects);
  if (projectNames.indexOf(action.project) === -1) {
    throw "Invalid project";
  }

  const id = Utilities.digest(action.data);
  await DB.writeDoc(action.user + "-" + action.project + "-" + id, action.data);

  return { docId: id, project: action.project, user: action.viewerUser };
}
