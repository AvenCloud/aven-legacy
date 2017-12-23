const { Op } = require("sequelize")

async function GetDocAction(action, app) {
  // todo, authentication here
  const doc = await app.model.doc.findOne({
    where: {
      id: { [Op.eq]: action.docID },
      associatedRecord: { [Op.eq]: action.recordID },
    },
  })
  return (
    doc && {
      docID: action.docID,
      value: doc.value,
    }
  )
}

module.exports = GetDocAction
