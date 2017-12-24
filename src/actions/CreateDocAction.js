const { Op } = require("sequelize")
const GetAuth = require("./GetAuth")
const { digest } = require("../Utilities")
const stringify = require("json-stable-stringify")

async function CreateDocAction(action, app) {
  const { recordID } = action
  const lastRecord =
    recordID &&
    (await app.model.record.findOne({
      where: { id: { [Op.eq]: recordID } },
    }))
  if (!lastRecord) {
    throw {
      statusCode: 400,
      code: "INVALID_RECORD",
      message: "This record cannot be found or written to",
    }
  }
  const permission = await GetAuth(action, app, lastRecord)
  if (permission !== "WRITE") {
    throw {
      statusCode: 400,
      code: "INVALID_PERMISSION",
      message: "You do not have permission to write to this record",
    }
  }
  const docContent = stringify(action.value)
  const docID = await digest(docContent)
  if (action.docID && action.docID !== docID) {
    throw {
      statusCode: 400,
      code: "INVALID_DOC_ID",
      field: "docID",
      message:
        "The docID, if provided, must match the sha1 (hex) checksum of the value",
    }
  }
  await app.model.doc.create({
    id: docID,
    value: action.value,
    associatedRecord: recordID,
    size: Buffer.byteLength(docContent, "utf8"),
    uploader: action.authUser,
  })
  return { docID, recordID, authPermission: permission }
}

module.exports = CreateDocAction
