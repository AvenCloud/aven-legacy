import DB from "./DB";
import Utilities from "./Utilities";
import {
  verifyIdentity
} from './AuthUtilities';

export default async function GetAccountAction(unverifiedAction) {
  let action = await verifyIdentity(unverifiedAction);
  const user = await DB.Model.User.findOne({
    where: {
      id: action.user
    }
  });
  if (!user) {
    throw 'Could not find user';
  }
  // something about listing records..
  return {
    id: user.id,
    isItYou: action.user === action.verifiedUser,
    displayName: user.displayName,
  };
}