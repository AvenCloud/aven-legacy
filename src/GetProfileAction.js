import DB from "./DB";
import Utilities from "./Utilities";
import { getAuth } from "./AuthUtilities";

export default async function GetProfileAction(action) {
  const userData = await DB.getDoc(action.user);
  if (!userData) {
    throw "Not found!";
  }
  if (action.viewerUser === action.user) {
    const auth = await getAuth(action.viewerUser, action.viewerSession);
    if (auth) {
      const { verifiedEmail, verifiedPhone, projects } = userData;
      return {
        verifiedEmail,
        verifiedPhone,
        projects,
        name: action.user
      };
    }
  }
  const { projects } = userData;
  const publicProjects = {};
  Object.keys(projects).forEach(pId => {
    if (projects[pId].isPublic) {
      publicProjects[pId] = projects[pId];
    }
  });
  return {
    name: action.user,
    projects: publicProjects
  };
}
