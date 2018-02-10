const GetAuth = require("./GetAuth");
const { Op } = require("sequelize");

async function SetRecordAction(action, infra, onSetRecord) {
  const recordID = action.recordID;
  const lastRecord = await infra.model.record.findOne({
    where: { id: { [Op.eq]: recordID } },
  });
  const permission = await GetAuth(action, infra, lastRecord);
  if (permission === "WRITE" && lastRecord) {
    await lastRecord.update({
      permission: action.permission,
      doc: action.docID,
    });
    onSetRecord(recordID, { docID: action.docID, recordID });
  } else if (permission === "WRITE") {
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
