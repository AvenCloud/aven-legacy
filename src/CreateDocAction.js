import DatabaseService from "./DatabaseService";
import { getAuth } from "./AuthUtilities";
import Utilities from "./Utilities";

export default async function CreateDocAction(action) {
  const auth = await getAuth(action.viewerUser, action.viewerSession);
  if (!auth) {
    throw "User is not authenticated";
  }
  const id = Utilities.digest(action.data);
  console.log(typeof action.data, action.data instanceof Buffer);
  console.log("digest", id);
  // TODO: Verify project name, no slashes
  // const userDoc = await DatabaseService.getDoc(action.viewerUser);
  // await DatabaseService.writeDoc(action.viewerUser, {
  //   ...userDoc,
  //   publishedDocs
  // });

  await DatabaseService.writeDoc("sha-1-" + id, action.data);

  return { coming: "soon" };
}
