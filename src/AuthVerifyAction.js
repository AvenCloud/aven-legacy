import DatabaseService from "./DatabaseService";
import Utilities from "./Utilities";

export default async function AuthVerifyAction(action) {
  const userData = await DatabaseService.getDoc(action.username);
  if (
    userData.emailVerification &&
    "" + userData.emailVerification.code === action.code
  ) {
    // todo: check emailVerification.verificationTime to make sure the code is still valid
    const sessionId = await Utilities.genSessionId();
    const { emailVerification } = userData;
    await DatabaseService.writeDoc(action.username, {
      ...userData,
      password: await Utilities.genHash(action.password),
      emailVerification: null,
      sessions: [sessionId],
      verifiedEmail: emailVerification.email
    });
    return {
      email: emailVerification.email,
      session: sessionId,
      username: action.username
    };
  }
  if (
    userData.phoneVerification &&
    "" + userData.phoneVerification.code === action.code
  ) {
    throw "Phone verification is not supported yet!";
  }
  throw "Verification code does not match!";
}
