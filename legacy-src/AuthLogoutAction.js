import DB from "./DB";
import Utilities from "./Utilities";
import DispatchAction from "./DispatchAction";

export default async function AuthLogoutAction(action) {
  const sessionID = action.session.split('-')[0];
  const token = action.session.split('-')[1];
  const session = await DB.Model.UserSession.findOne({
    where: {
      id: sessionID
    }
  });
  if (await Utilities.compareHash(token, session.secret)) {
    await session.destroy();
  } else if (await Utilities.compareHash(token, session.logoutToken)) {
    await session.destroy();
  } else {
    throw 'Invalid session secret or logout token!'
  }
  return {};
}