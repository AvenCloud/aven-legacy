const { Op } = require("sequelize");

async function AuthVerifyAction(action, infra) {
  const authMethod = await infra.model.authMethod.findOne({
    where: {
      id: {
        [Op.eq]: action.authID,
      },
      verificationKey: {
        [Op.eq]: action.code,
      },
      owner: {
        [Op.eq]: action.userID,
      },
    },
  });
  if (!authMethod) {
    throw {
      statusCode: 400,
      code: "INVALID_VERIFICATON",
      message: "Could not be verified",
    };
  }
  if (authMethod.verificationExpiration) {
    // todo check time to verify late verification
  }
  await authMethod.update({
    verificationExpiration: null,
    verificationKey: null,
  });
  return {
    userID: action.userID,
    authID: action.authID,
  };
}

module.exports = AuthVerifyAction;
