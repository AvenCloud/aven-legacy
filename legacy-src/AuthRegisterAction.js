import DB from "./DB";
import {
  sendSMS
} from "./PhoneService";
import {
  sendEmail
} from "./EmailService";
import Utilities from "./Utilities";

const validator = require("validator");

const looksLikeAnEmail = str =>
  typeof str === "string" && str.length > 5 && str.split("@").length === 2;

const cleanPhoneString = str =>
  str
  .replace(/-/g, "")
  .replace(/\+/g, "")
  .replace(/\(/g, "")
  .replace(/\)/g, "")
  .replace(/ /g, "");
const looksLikeAPhoneNumber = str => {
  if (typeof str !== "string") return false;
  return validator.isNumeric(cleanPhoneString(str));
};

export default async function AuthRegisterAction(action) {
  const validatedName = action.name
    .trim()
    .replace(/ /g, "-")
    .replace(/_/g, "-");
  const displayName = action.displayName;
  if (!displayName) {
    throw 'Missing displayName';
  }
  if (action.password.length < 5) {
    throw 'Password is too short';
  }
  const password = await Utilities.genHash(action.password);
  if (!looksLikeAnEmail(action.email)) {
    throw 'Invalid email address';
  }
  try {
    await DB.Model.User.create({
      displayName,
      password,
      id: validatedName,
    });
  } catch (e) {
    if (e.name === 'SequelizeUniqueConstraintError') {
      throw 'Duplicate Username';
    } else {
      console.error('Database Error: ', e);
      throw 'Database Error';
    }
  }

  const authCode = await Utilities.genAuthCode();
  try {
    await DB.Model.AuthenticationMethod.create({
      id: action.email,
      type: 'EMAIL',
      owner: validatedName,
      primaryOwner: validatedName,
      verificationKey: authCode,
      verificationExpiration: new Date(),
    });
  } catch (e) {
    if (e.name === 'SequelizeUniqueConstraintError') {
      await DB.Model.User.destroy({
        where: {
          id: validatedName
        }
      });
      throw 'Duplicate Email Address';
    } else {
      console.error('Database Error: ', e);
      throw 'Database Error';
    }
  }
  await sendEmail(
    action.email,
    `Welcome to Aven`,
    `Hello, ${validatedName}! Your auth code is ${authCode}
  Or, click here:

  https://aven.io/auth/verify?username=${validatedName}&code=${authCode}
        `
  );
  return {
    name: validatedName
  };
}