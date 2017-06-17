import DatabaseService from "./DatabaseService";
import Utilities from "./Utilities";

export default async function GetProfileAction(action) {
  const userData = await DatabaseService.getDoc(action.user);
  if (!userData) {
    throw "Not found!";
  }
  const {
    password,
    emailVerification,
    phoneVerification,
    sessions,
    ...safeUserData
  } = userData;
  return safeUserData;
}
