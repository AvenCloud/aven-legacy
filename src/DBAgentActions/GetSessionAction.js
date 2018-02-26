const { Op } = require("sequelize");
const { genHash, genSessionId, compareHash } = require("../Utilities");

async function GetSessionAction(action, infra) {
  const { authUser, authSession } = action;
  if (!authSession) {
    throw {
      statusCode: 400,
      code: "INVALID_SESSION",
      message: "Session could not be verified",
    };
  }
  const sessionID = authSession.split("-")[0];
  const sessionToken = authSession.split("-")[1];
  const session = await infra.model.userSession.findOne({
    where: { id: { [Op.eq]: sessionID } },
  });
  if (
    !session ||
    !await compareHash(sessionToken, session.secret) ||
    session.user !== authUser
  ) {
    throw {
      statusCode: 400,
      code: "INVALID_SESSION",
      message: "Session could not be verified",
      authSession,
      authUser,
    };
  }
  return { authUser, authSession, userID: authUser };
}

module.exports = GetSessionAction;
