const { compareHash } = require("../Utilities")

async function getRecordPermission(action, app, record) {
  const sessionID = action.authSession.split("-")[0]
  const sessionToken = action.authSession.split("-")[1]
  const session = await app.model.userSession.findOne({
    where: { id: sessionID },
  })
  if (
    !await compareHash(sessionToken, session.secret) ||
    session.user !== action.authUser
  ) {
    throw {
      statusCode: 400,
      code: "INVALID_SESSION",
      message: "Session could not be verified",
    }
  }
  if (!record || action.authUser === record.owner) {
    return "WRITE"
  }
  return record.permission === "PUBLIC" ? "READ" : "NONE"
}

async function SetRecordAction(action, app) {
  const recordID = action.id
  const lastRecord = await app.model.record.findOne({ where: { id: recordID } })
  const permission = await getRecordPermission(action, app, lastRecord)
  if (permission === "WRITE" && lastRecord) {
    await lastRecord.update({
      permission: action.permission,
      doc: action.doc,
    })
  } else if (permission === "WRITE") {
    await app.model.record.create({
      id: recordID,
      owner: action.authUser,
      permission: action.permission,
      doc: action.doc,
    })
  }
}

module.exports = SetRecordAction
