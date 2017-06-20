import DatabaseService from "./DatabaseService";
import Utilities from "./Utilities";

export default async function HandleLogout(req, res, next, navAction) {
  if (req.auth) {
    const user = req.auth.user;
    const userDoc = await DatabaseService.getDoc(user);
    const newSessions = [];
    const sessions = userDoc.sessions ? userDoc.sessions.slice() : [];
    sessions.forEach(s => {
      if (s !== req.authenticatedSession) {
        sessions.push(s);
      }
    });
    await DatabaseService.writeDoc(user, {
      ...userDoc,
      sessions: newSessions
    });
    res.clearCookie("username");
    res.clearCookie("session");
    res.redirect("/");
  }
  res.send(400);
}
