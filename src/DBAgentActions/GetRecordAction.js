const { Op } = require("sequelize");

async function GetRecordAction(action, infra, onRecord, dispatch) {
  const { authUser, authSession, recordID } = action;

  const permission = await dispatch({
    type: "GetPermissionAction",
    authSession,
    authUser,
    recordID,
  });

  if (!permission.canRead) {
    throw {
      message: "Permission denied",
      statusCode: 403,
    };
  }

  const record = await infra.model.record.findOne({
    where: { id: { [Op.eq]: action.recordID } },
  });
  if (!record) {
    return {
      id: null,
    };
  }
  return {
    ...permission,
    recordID: action.recordID,
    docID: record.doc,
    owner: record.owner,
  };
}

module.exports = GetRecordAction;
