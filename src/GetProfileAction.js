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
      const { verifiedEmail, verifiedPhone, projects, name } = userData;
      return {
        verifiedEmail,
        verifiedPhone,
        projects,
        name
      };
    }
  }
  const { projects, name } = userData;
  const publicProjects = projects.filter(p => p.isPublic);
  return {
    name,
    projects: publicProjects
  };
}
