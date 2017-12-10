import DB from "./DB";
import Utilities from './Utilities';

export async function verifyIdentity(action) {
  if (action.viewerUser == null && action.viewerSession == null) {
    return action;
  }
  const user = await DB.Model.User.findOne({
    where: {
      id: action.viewerUser
    }
  });
  const sessionId = action.viewerSession.split('-')[0];
  const sessionSecret = action.viewerSession.split('-')[1];
  const session = await DB.Model.UserSession.findOne({
    where: {
      id: sessionId
    }
  });
  if (!session) {
    throw 'Session not found!';
  }
  const doesVerify = await Utilities.compareHash(sessionSecret, session.secret);
  return {
    ...action,
    verifiedUser: doesVerify ? action.viewerUser : null
  };
}