import DatabaseService from "./DatabaseService";
import Utilities from "./Utilities";
import DispatchAction from "./DispatchAction";

export default async function HandleLogout(req, res, next, navAction) {
  if (req.auth) {
    const user = req.auth.user;
    const session = req.auth.session;
    try {
      const result = await DispatchAction({
        type: "AuthLogoutAction",
        viewerUser: user,
        viewerSession: session
      });
    } catch (e) {
      res.status(400).send(e);
    }
    res.clearCookie("username");
    res.clearCookie("session");
    res.redirect("/");
  } else {
    res.status(400).send("No session!");
  }
}
