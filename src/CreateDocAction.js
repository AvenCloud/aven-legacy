import DatabaseService from "./DatabaseService";
import { getAuth } from "./AuthUtilities";
import Utilities from "./Utilities";

export default async function CreateDocAction(action) {
  const auth = await getAuth(action.viewerUser, action.viewerSession);
  if (!auth) {
    throw "User is not authenticated";
  }
  const id = Utilities.digest(action.data);
  await DatabaseService.writeDoc(id, action.data);

  return { coming: "soon" };
}
