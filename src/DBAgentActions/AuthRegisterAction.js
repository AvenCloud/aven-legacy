const { Op } = require("sequelize");
const { genAuthCode, genHash } = require("../Utilities");

async function AuthRegisterAction(action, infra) {
  // this is where all the validation logic will go

  const userID = action.userID;

  try {
    await infra.model.user.create({
      displayName: action.displayName,
      password: await genHash(action.password),
      id: userID,
    });
  } catch (e) {
    if (e.name === "SequelizeUniqueConstraintError") {
      throw {
        statusCode: 400,
        code: "EXISTING_USERNAME",
        field: "id",
        message: "Duplicate username",
      };
    } else {
      console.error("Database Error: ", e);
      throw {
        statusCode: 500,
        code: "DB_ERROR",
        message: "Database Error",
      };
    }
  }

  const authCode = await genAuthCode();
  try {
    await infra.model.authMethod.create({
      id: action.email,
      type: "EMAIL",
      owner: userID,
      primaryOwner: userID,
      verificationKey: authCode,
      verificationExpiration: new Date(),
    });
  } catch (e) {
    if (e.name === "SequelizeUniqueConstraintError") {
      await infra.model.user.destroy({
        where: {
          id: {
            [Op.eq]: userID,
          },
        },
      });
      throw {
        statusCode: 400,
        code: "EXISTING_EMAIL",
        field: "email",
        message: "Duplicate email address",
      };
    } else {
      console.error("Database Error: ", e);
      throw {
        statusCode: 500,
        code: "DB_ERROR",
        message: "Database Error",
      };
    }
  }

  await infra.email.send(
    action.email,
    "Welcome",
    `
    Welcome to Aven!
    http://foo/?code=${authCode}
  `,
    { authCode },
  );

  return {
    userID,
    authID: action.email,
  };
}

module.exports = AuthRegisterAction;
