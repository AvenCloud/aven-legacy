import DB from "./DB";
import {
  sendSMS
} from "./PhoneService";
import {
  sendEmail
} from "./EmailService";
import Utilities from "./Utilities";

const validator = require("validator");

export default async function AuthResetAction(action, dispatch) {
  // todo..... this whole action
  if (userData && userData.verifiedEmail) {
    const name = action.username_email_or_phone;
    const resetCode = await Utilities.genAuthCode();

    await sendEmail(
      userData.verifiedEmail,
      `Reset Password on Aven`,
      `Hello, ${name}! Your reset code is ${resetCode}
  Or, click here:

  https://aven.io/auth/verify_reset?username=${name}&code=${resetCode}
        `
    );
    // todoo... modify AuthenticationMethod with reset info
  } else if (userData && userData.verifiedPhone) {
    // reset with phone info
    throw "coming soon";
  } else if (userData) {
    // re-send initial verification code
    throw "coming soon";
  } else {
    // this likely means they have requested reset with a phone or an email, which are not supported yet for resets
    throw "coming soon";
  }
}