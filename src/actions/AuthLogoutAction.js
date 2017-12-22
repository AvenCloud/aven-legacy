const { compareHash } = require("../Utilities")

async function AuthLogoutAction(action, app) {
  const sessionID = action.session.split("-")[0]
  const token = action.session.split("-")[1]
  const session = await app.model.userSession.findOne({
    where: {
      id: sessionID,
    },
  })
  if (await compareHash(token, session.secret)) {
    await session.destroy()
  } else if (await compareHash(token, session.logoutToken)) {
    await session.destroy()
  } else {
    throw {
      statusCode: 400,
      code: "INVALID_TOKEN",
      message: "Invalid session secret or logout token!",
    }
  }
  return {}
}

module.exports = AuthLogoutAction
