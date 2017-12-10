import DB from "./DB";
import { getAuth } from "./AuthUtilities";
import Utilities from "./Utilities";

export default async function GetDocAction(action) {
  const getDoc = async () =>
    await DB.getDoc(action.user + "-" + action.project + "-" + action.id);

  if (action.viewerUser === action.user) {
    return getDoc();
  }

  const userDoc = await DB.getDoc(action.user);
  const proj = userDoc && userDoc.projects && userDoc.projects[action.project];
  if (proj && proj.isPublic) {
    return getDoc();
  }
  throw "Invalid project";
}
