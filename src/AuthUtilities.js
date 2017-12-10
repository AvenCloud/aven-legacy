import DB from "./DB";

export async function getAuth(user, session) {
  if (user && session) {
    const userDoc = await DB.getDoc(user);
    if (
      userDoc && userDoc.password && userDoc.sessions.indexOf(session) !== -1
    ) {
      return {
        session,
        user
      };
    }
  }
  return null;
}
