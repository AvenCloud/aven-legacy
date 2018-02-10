const { Op } = require("sequelize");
const { compareHash } = require("../Utilities");

async function AuthLogoutAction(action, infra) {
  const sessionID = action.session.split("-")[0];
  const token = action.session.split("-")[1];
  const session = await infra.model.userSession.findOne({
    where: {
      id: {
        [Op.eq]: sessionID,
      },
    },
  });
  if (await compareHash(token, session.secret)) {
    await session.destroy();
  } else if (await compareHash(token, session.logoutToken)) {
    await session.destroy();
  } else {
    throw {
      statusCode: 400,
      code: "INVALID_TOKEN",
      message: "Invalid session secret or logout token!",
    };
  }
  return {};
}

module.exports = AuthLogoutAction;
