const { Op } = require("sequelize");

async function GetDocAction(action, infra) {
  // todo, authentication here
  const doc = await infra.model.doc.findOne({
    where: {
      id: { [Op.eq]: action.docID },
    },
  });

  // Use one error for multiple types of miss, to protect privacy!
  const notFoundError = {
    statusCode: 400,
    code: "INVALID_DOC",
    message: `Document with ID '${action.docID}' and record '${
      action.recordID
    }' does not exist.`,
  };
  if (!doc) {
    throw notFoundError;
  }

  const docRecord = await infra.model.docRecord.findOne({
    where: {
      docId: { [Op.eq]: action.docID },
      recordId: { [Op.eq]: action.recordID },
    },
  });

  if (!docRecord) {
    throw notFoundError;
  }

  return {
    docID: action.docID,
    recordID: action.recordID,
    value: doc.value,
  };
}

module.exports = GetDocAction;
