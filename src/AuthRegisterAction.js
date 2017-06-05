import DatabaseService from "./DatabaseService";
import { sendSMS } from "./PhoneService";
import { sendEmail } from "./EmailService";

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
      code: Math.floor(Math.random() * 10000)
    };
  } else if (phone) {
    user.phoneVerification = {
      verificationTime: Date.now() / 1000,
      phone,
      code: Math.floor(Math.random() * 10000)
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
      `welcome and verification`,
      `your code is ${user.emailVerification.code}`
    );
  }
  if (user.phoneVerification) {
    await sendSMS(
      user.phoneVerification.phone,
      `your code is ${user.phoneVerification.code}`
    );
  }
  return { name: action.name };
}
