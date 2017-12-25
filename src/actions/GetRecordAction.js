const { Op } = require("sequelize")

async function GetRecordAction(action, app) {
  // todo, authentication here
  const record = await app.model.record.findOne({
    where: { id: { [Op.eq]: action.recordID } },
  })
  return {
    id: action.recordID,
    permission: record.permission,
    doc: record.doc,
    owner: record.owner,
  }
}

module.exports = GetRecordAction