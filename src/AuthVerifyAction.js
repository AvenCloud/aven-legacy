import DB from "./DB";
import Utilities from "./Utilities";

export default async function AuthVerifyAction(action) {
  const authMethod = await DB.Model.AuthenticationMethod.findOne({
    where: {
      id: action.id,
      verificationKey: action.code,
      owner: action.user,
    }
  });
  if (!authMethod) {
    throw 'Could not be verified';
  }
  if (authMethod.verificationExpiration) {
    console.log('yo!', authMethod.verificationExpiration, typeof authMethod.verificationExpiration);
    const daye = new Date(authMethod.verificationExpiration);
    // todo check time to verify late verification
  }
  await authMethod.update({
    verificationExpiration: null,
    verificationKey: null,
  });
  return {
    good: 'news, everyone!'
  };
  throw "Verification code does not match!";
}