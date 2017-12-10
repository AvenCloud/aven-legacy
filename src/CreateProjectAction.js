import DB from "./DB";
import { getAuth } from "./AuthUtilities";
import Utilities from "./Utilities";
import SocketConnection from "./SocketConnection";

export default async function CreateProjectAction(action) {
  const auth = await getAuth(action.viewerUser, action.viewerSession);
  if (!auth) {
    throw "User is not authenticated";
  }
  //todo: verify project name, no slashes
  const userDoc = await DB.getDoc(action.viewerUser);
  const projects = userDoc.projects || {};

  const projectName = action.projectName
    .trim()
    .replace(/ /g, "-")
    .replace(/_/g, "-");
  if (projects[projectName]) {
    throw "Project with this name already exists!";
  }
  const creationTime = Math.floor(Date.now() / 1000);
  const newProject = {
    rootDoc: null,
    creationTime,
    updateTime: creationTime,
    isPublic: action.isPublic
  };
  await DB.writeDoc(action.viewerUser, {
    ...userDoc,
    projects: {
      ...projects,
      [projectName]: newProject
    }
  });
  SocketConnection.notifyAccount(action.viewerUser);
  return { projectName, isPublic: action.isPublic };
}
