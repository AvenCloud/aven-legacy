import DatabaseService from "./DatabaseService";
import { getAuth } from "./AuthUtilities";
import Utilities from "./Utilities";

export default async function GetAccountAction(action) {
  const auth = await getAuth(action.viewerUser, action.viewerSession);
  if (!auth) {
    throw "User is not authenticated";
  }
  const userDoc = await DatabaseService.getDoc(action.viewerUser);
  return {
    name: userDoc.name
  };
}
