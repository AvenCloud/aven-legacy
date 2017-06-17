import DatabaseService from "./DatabaseService";
import Utilities from "./Utilities";

export default async function HandleLogout(req, res, next, navAction) {
  if (req.authenticatedUser) {
    const sessions = [];
    req.authenticatedUserDoc.sessions.forEach(s => {
      if (s !== req.authenticatedSession) {
        sessions.push(s);
      }
    });
    await DatabaseService.writeDoc(req.authenticatedUser, {
      ...req.authenticatedUserDoc,
      sessions
    });
    res.clearCookie("username");
    res.clearCookie("session");
    res.redirect("/");
  }
}
