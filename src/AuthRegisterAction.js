import DatabaseService from "./DatabaseService";
import { sendSMS } from "./PhoneService";
import { sendEmail } from "./EmailService";
import Utilities from "./Utilities";

const validator = require("validator");

const looksLikeAnEmail = str =>
  typeof str === "string" && str.length > 5 && str.split("@").length === 2;

const looksLikeAPhoneNumber = str => {
  if (typeof str !== "string") return false;
  const newStr = str
    .replace(/-/g, "")
    .replace(/\+/g, "")
    .replace(/\(/g, "")
    .replace(/\)/g, "")
    .replace(/ /g, "");
  return validator.isNumeric(newStr);
};

// if (  Configuration.secrets.alpha_pass_names ) {
//   const passes = Configuration.secrets.alpha_pass_names.map(name => action.name.search(name) === -1);
//   const passes = Configuration.secrets.alpha_pass_names.map(name => action.name.search(name) === -1);
// }
//   !(
//     action.name.search() !== -1 ||
//     asdf
//   )
// ) {
//   return 'You have not been invited to this alpha yet. Try asking around?';
// }

export default async function AuthRegisterAction(action) {
  const user = {
    emailVerification: null,
    phoneVerification: null
  };
  const email = looksLikeAnEmail(action.email)
    ? action.email
    : looksLikeAnEmail(action.email_or_phone) ? action.email_or_phone : null;
  const phone = looksLikeAPhoneNumber(action.phone)
    ? action.phone
    : looksLikeAPhoneNumber(action.email_or_phone)
      ? action.email_or_phone
      : null;
  if (email) {
    user.emailVerification = {
      verificationTime: Date.now() / 1000,
      email,
      code: await Utilities.genAuthCode()
    };
  } else if (phone) {
    user.phoneVerification = {
      verificationTime: Date.now() / 1000,
      phone,
      code: await Utilities.genAuthCode()
    };
  } else {
    throw "No valid email address or phone number!";
  }
  try {
    await DatabaseService.createDoc(action.name, user);
  } catch (e) {
    if (e.constraint === "primarykey") {
      throw {
        detail: `A user with the name '${action.name}' already exists.`,
        code: "DUPE_USER"
      };
    }
    throw e.detail;
  }
  if (user.emailVerification) {
    await sendEmail(
      user.emailVerification.email,
      `Welcome to Aven`,
      `Hello, ${action.name}! Your auth code is ${user.emailVerification.code}
Or, click here:

https://aven.io/auth/verify?username=${action.name}&code=${user
        .emailVerification.code}
      `
    );
  }
  if (user.phoneVerification) {
    await sendSMS(
      user.phoneVerification.phone,
      `Your Aven authentication code is ${user.phoneVerification.code}`
    );
  }
  return { name: action.name };
}
