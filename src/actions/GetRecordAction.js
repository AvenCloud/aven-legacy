async function GetRecordAction(action, app) {
  // todo, authentication here
  const record = await app.model.record.findOne({
    where: { id: action.id },
  })
  return {
    id: action.id,
    permission: record.permission,
    doc: record.doc,
    owner: record.owner,
  }
}

module.exports = GetRecordAction
