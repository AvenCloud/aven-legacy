import DB from "./DB";
import Utilities from "./Utilities";

export default async function GetAccountAction(action) {
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
    displayName: user.displayName,
  };
}