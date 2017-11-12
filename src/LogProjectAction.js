import DatabaseService from "./DatabaseService";
import SocketConnection from "./SocketConnection";
import { getAuth } from "./AuthUtilities";
import Utilities from "./Utilities";

export default async function LogProjectAction(action, dispatch) {
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
	const lastProject = projects[action.projectName];

	// the assumption for log project is that we always provide an object for this doc!
	const docToPublish = {
		...action.doc,
		logUpdateTime: updateTime,
		logParentId: lastProject.rootDoc
	};
	const { docId } = await dispatch({
		type: "CreateDocAction",
		viewerUser: action.viewerUser,
		viewerSession: action.viewerSession,
		user: action.viewerUser,
		project: action.projectName,
		data: JSON.stringify(docToPublish)
	});
	const newProject = {
		...lastProject,
		updateTime,
		rootDoc: docId
	};
	await DatabaseService.writeDoc(action.viewerUser, {
		...userDoc,
		projects: {
			...projects,
			[action.projectName]: newProject
		}
	});
	SocketConnection.notifyProject(
		`${action.viewerUser}/${action.projectName}`,
		newProject.rootDoc
	);
	return { projectName: action.projectName, ...newProject };
}
