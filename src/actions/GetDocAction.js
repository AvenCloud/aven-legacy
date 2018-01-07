const { Op } = require("sequelize")

async function GetDocAction(action, app) {
  // todo, authentication here
  const doc = await app.model.doc.findOne({
    where: {
      id: { [Op.eq]: action.docID },
    },
  })
  if (!doc) {
    throw {
      statusCode: 400,
      code: "INVALID_DOC_ID",
      message: `Document with ID '${action.docID}'' does not exist.`,
    }
  }

  const docRecordLink = await app.model.link.findOne({
    where: {
      from: { [Op.eq]: action.docID },
      to: { [Op.eq]: action.recordID },
    },
  })

  if (!docRecordLink) {
    throw {
      statusCode: 400,
      code: "INVALID_DOC_RECORD_ASSOCIATION",
      message: `The requested document is not associated with record with ID '${
        action.recordID
      }'.`,
    }
  }

  return (
    doc && {
      docID: action.docID,
      value: doc.value,
    }
  )
}

module.exports = GetDocAction
