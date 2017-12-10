import DB from "./DB";
import Utilities from "./Utilities";

export default async function GetProjectAction(action) {
  const profile = await DB.getDoc(action.user);
  if (!profile || !profile.projects) {
    throw "Not found!";
  }
  const project = profile.projects[action.project];
  if (!project) {
    throw "Not found!";
  }
  if (!project.isPublic && action.user !== action.viewerUser) {
    throw "Not found!";
  }
  return project;
}
