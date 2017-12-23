const { Op } = require("sequelize")

async function AuthVerifyAction(action, app, dispatch) {
  const authMethod = await app.model.authMethod.findOne({
    where: {
      id: {
        [Op.eq]: action.id,
      },
      verificationKey: {
        [Op.eq]: action.code,
      },
      owner: {
        [Op.eq]: action.user,
      },
    },
  })
  if (!authMethod) {
    throw {
      statusCode: 400,
      code: "INVALID_VERIFICATON",
      message: "Could not be verified",
    }
  }
  if (authMethod.verificationExpiration) {
    // todo check time to verify late verification
  }
  await authMethod.update({
    verificationExpiration: null,
    verificationKey: null,
  })
  return {
    userID: action.user,
    authID: action.id,
  }
}

module.exports = AuthVerifyAction
