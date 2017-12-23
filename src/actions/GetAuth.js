const { compareHash } = require("../Utilities")

async function GetAuth(action, app, record) {
  const { authSession, authUser } = action
  if (!authUser) {
    throw { message: "Non-authenticated activity is not yet implemented" }
  }
  if (!authSession) {
    throw {
      statusCode: 400,
      code: "INVALID_SESSION",
      message: "Session could not be verified",
    }
  }
  const sessionID = authSession.split("-")[0]
  const sessionToken = authSession.split("-")[1]
  const session = await app.model.userSession.findOne({
    where: { id: sessionID },
  })
  if (
    !await compareHash(sessionToken, session.secret) ||
    session.user !== authUser
  ) {
    throw {
      statusCode: 400,
      code: "INVALID_SESSION",
      message: "Session could not be verified",
    }
  }
  if (!record || authUser === record.owner) {
    return "WRITE"
  }
  return record.permission === "PUBLIC" ? "READ" : "NONE"
}

module.exports = GetAuth
