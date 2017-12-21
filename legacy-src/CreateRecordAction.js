import DB from "./DB";
import {
  verifyIdentity
} from "./AuthUtilities";
import Utilities from "./Utilities";
import SocketConnection from "./SocketConnection";

export default async function CreateRecordAction(unverifiedAction) {
  const action = await verifyIdentity(unverifiedAction);
  if (!action.verifiedUser) {
    throw "User is not authenticated";
  }
  //todo: verify project name, no slashes
  const recordName = action.record
    .trim()
    .replace(/ /g, "-")
    .replace(/_/g, "-");
  const permission = action.isPublic ? 'PUBLIC' : 'PRIVATE';
  try {
    await DB.Model.Record.create({
      id: recordName,
      doc: null,
      owner: action.verifiedUser,
      permission,
    });
  } catch (e) {
    if (e.name === 'SequelizeUniqueConstraintError') {
      throw 'Record with this ID already exists!';
    }
  }

  SocketConnection.notifyAccount(action.verifiedUser);
  return {
    id: recordName,
    permission,
  };
}