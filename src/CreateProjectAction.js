import DatabaseService from "./DatabaseService";
import { getAuth } from "./AuthUtilities";
import Utilities from "./Utilities";

export default async function CreateProjectAction(action) {
  const auth = await getAuth(action.viewerUser, action.viewerSession);
  if (!auth) {
    throw "User is not authenticated";
  }
  //todo: verify project name, no slashes
  const userDoc = await DatabaseService.getDoc(action.viewerUser);
  const publicProjects = userDoc.publicProjects
    ? userDoc.publicProjects.slice()
    : [];
  const privateProjects = userDoc.privateProjects
    ? userDoc.privateProjects.slice()
    : [];
  const newProject = {
    name: action.projectName,
    isPublic: action.isPublic
  };
  if (action.isPublic) {
    publicProjects.push(newProject);
  } else {
    privateProjects.push(newProject);
  }
  await DatabaseService.writeDoc(action.viewerUser, {
    ...userDoc,
    publicProjects,
    privateProjects
  });
  await DatabaseService.writeDoc(action.viewerUser + "/" + action.projectName, {
    name: action.projectName
  });
  return { newProject: action.projectName, isPublic: action.isPublic };
}
