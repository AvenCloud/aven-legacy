import DatabaseService from "./DatabaseService";
import Utilities from "./Utilities";
import { getAuth } from "./AuthUtilities";

export default async function GetProfileAction(action) {
  const userData = await DatabaseService.getDoc(action.user);
  if (!userData) {
    throw "Not found!";
  }
  if (action.viewerUser === action.user) {
    const auth = await getAuth(action.viewerUser, action.viewerSession);
    if (auth) {
      const {
        verifiedEmail,
        verifiedPhone,
        publicProjects,
        privateProjects,
        name
      } = userData;
      return {
        verifiedEmail,
        verifiedPhone,
        publicProjects,
        privateProjects,
        name
      };
    }
  }
  const { publicProjects, name } = userData;
  return {
    name,
    publicProjects
  };
}
