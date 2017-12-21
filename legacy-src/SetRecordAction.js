import DB from "./DB";
import SocketConnection from "./SocketConnection";
import {
  verifyIdentity
} from "./AuthUtilities";
import Utilities from "./Utilities";

export default async function SetRecordAction(unverifiedAction) {
  const action = verifyIdentity(unverifiedAction);
  if (!action.verifiedUser) {
    throw "User is not authenticated";
  }
  const record = DB.Model.Record.findOne({
    where: {
      id: action.record
    },
  });
  await record.update({
    doc: action.doc,
    // last update time? idk
  });
  return {
    doc: action.doc,
  };

  SocketConnection.notifyProject(
    `${action.record}`,
    action.doc
  );
  return {
    record: action.record,
    doc: action.doc,
  };
}