import DatabaseService from "./DatabaseService";
import Utilities from "./Utilities";
import DispatchAction from "./DispatchAction";

export default async function AuthLogoutAction(action) {
	if (!action.viewerUser || !action.viewerSession) {
		throw "Invalid session";
	}
	const userData = await DatabaseService.getDoc(action.viewerUser);
	if (!userData) {
		throw "Invalid User";
	}
	if (!userData.password) {
		throw "User is not set up yet";
	}
	await DatabaseService.writeDoc(action.viewerUser, {
		...userData,
		sessions: userData.sessions.filter(s => s !== action.viewerSession)
	});
	return {
		username: action.viewerUser
	};
}
