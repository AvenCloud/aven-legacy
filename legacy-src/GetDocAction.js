import DB from "./DB";
import {
  verifyIdentity
} from "./AuthUtilities";
import Utilities from "./Utilities";

export default async function GetDocAction(unverifiedAction) {
  const action = await verifyIdentity(unverifiedAction);

  // todo: await Utilities.verifyRecordPermission(action, action.record, 'READ')
  const doc = await DB.Model.Doc.findOne({
    where: {
      associatedRecord: action.record,
      id: action.id,
    }
  });
  return doc;
}