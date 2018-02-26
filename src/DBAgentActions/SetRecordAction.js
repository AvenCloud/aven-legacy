const { Op } = require("sequelize");

async function SetRecordAction(action, infra, onSetRecord, dispatch) {
  const { recordID, authUser, authSession } = action;

  const permission = await dispatch({
    type: "GetPermissionAction",
    authSession,
    authUser,
    recordID,
  });

  if (!permission.canWrite) {
    throw {
      message: "Permission denied",
      statusCode: 403,
    };
  }

  const lastRecord = await infra.model.record.findOne({
    where: { id: { [Op.eq]: recordID } },
  });
  if (lastRecord) {
    await lastRecord.update({
      permission: action.permission,
      doc: action.docID,
    });
    onSetRecord(recordID, { docID: action.docID, recordID });
  } else {
    await infra.model.record.create({
      id: recordID,
      owner: action.authUser,
      permission: action.permission,
      doc: action.docID,
    });
    onSetRecord(recordID, { docID: action.docID, recordID });
  }
  return { recordID };
}

module.exports = SetRecordAction;
