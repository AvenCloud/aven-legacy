const { Op } = require("sequelize");

async function GetRecordAction(action, infra) {
  // todo, authentication here
  const record = await infra.model.record.findOne({
    where: { id: { [Op.eq]: action.recordID } },
  });
  if (!record) {
    return {
      id: null,
    };
  }
  return {
    recordID: action.recordID,
    // permission: record.permission,
    docID: record.doc,
    // owner: record.owner,
  };
}

module.exports = GetRecordAction;
