const { Op } = require("sequelize");

async function GetDocAction(action, infra, onRecord, dispatch) {
  const { authUser, authSession, recordID, docID } = action;

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

  const doc = await infra.model.doc.findOne({
    where: {
      id: { [Op.eq]: docID },
    },
  });

  // Use one error for multiple types of miss, to protect privacy!
  const notFoundError = {
    statusCode: 400,
    code: "INVALID_DOC",
    message: `Document with ID '${docID}' and record '${recordID}' does not exist.`,
  };
  if (!doc) {
    throw notFoundError;
  }

  const docRecord = await infra.model.docRecord.findOne({
    where: {
      docId: { [Op.eq]: docID },
      recordId: { [Op.eq]: recordID },
    },
  });

  if (!docRecord) {
    throw notFoundError;
  }

  return {
    docID,
    recordID,
    value: doc.value,
  };
}

module.exports = GetDocAction;
