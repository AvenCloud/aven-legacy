import DatabaseService from "./DatabaseService";
import { getAuth } from "./AuthUtilities";
import Utilities from "./Utilities";

export default async function SetProjectAction(action) {
  const auth = await getAuth(action.viewerUser, action.viewerSession);
  if (!auth) {
    throw "User is not authenticated";
  }
  const userDoc = await DatabaseService.getDoc(action.viewerUser);
  const projects = userDoc.projects || {};
  if (!projects[action.projectName]) {
    throw "Project with this name does not exist!";
  }
  const updateTime = Math.floor(Date.now() / 1000);
  const newProject = {
    ...projects[action.projectName],
    updateTime
  };
  if (action.rootDoc != null) {
    newProject.rootDoc = action.rootDoc;
  }
  if (action.isPublic != null) {
    newProject.isPublic = action.isPublic;
  }
  await DatabaseService.writeDoc(action.viewerUser, {
    ...userDoc,
    projects: {
      ...projects,
      [action.projectName]: newProject
    }
  });
  return { projectName: action.projectName, ...newProject };
}
