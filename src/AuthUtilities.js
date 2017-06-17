import DatabaseService from "./DatabaseService";

export async function getAuth(user, session) {
  if (user && session) {
    const userDoc = await DatabaseService.getDoc(user);
    if (userDoc.password && userDoc.sessions.indexOf(session) !== -1) {
      return {
        session,
        user
      };
    }
  }
  return null;
}
