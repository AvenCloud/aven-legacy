import DatabaseService from "./DatabaseService";
import Utilities from "./Utilities";

export default async function GetProjectAction(action) {
  const projectData = await DatabaseService.getDoc(
    action.user + "/" + action.project
  );
  if (!projectData) {
    throw "Not found!";
  }
  return projectData;
}
