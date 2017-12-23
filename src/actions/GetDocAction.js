async function GetDocAction(action, app) {
  // todo, authentication here
  const doc = await app.model.doc.findOne({
    where: { id: action.docID, associatedRecord: action.recordID },
  })
  return (
    doc && {
      docID: action.docID,
      value: doc.value,
    }
  )
}

module.exports = GetDocAction
