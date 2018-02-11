const { Op } = require("sequelize");
const { compareHash } = require("../Utilities");

const OCTAL_READ = 4;
const OCTAL_WRITE = 2;
const OCTAL_EXECUTE = 1;

const canRead = val => !!val & OCTAL_READ;
const canExecute = val => !!val & OCTAL_EXECUTE;
const canWrite = val => !!val & OCTAL_WRITE;

const addPermissions = (a, b) => a | b;
const subtractPermissions = (a, b) => a & ~b;

async function GetPermissionAction(action, infra) {
  const { authSession, authUser, recordID } = action;
  if (!authUser) {
    throw { message: "Non-authenticated activity is not yet implemented" };
  }
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
  const record = await infra.model.record.findOne({
    where: { id: { [Op.eq]: recordID } },
  });
  if (!record || authUser === record.owner) {
    return "WRITE";
  }
  const permission = record.permission === "PUBLIC" ? "READ" : "NONE";
  return {
    recordID,
    permission,
  };
}

module.exports = GetPermissionAction;
