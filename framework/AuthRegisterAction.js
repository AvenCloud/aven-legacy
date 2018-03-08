({ Agent, Cookie }) => {
  async function Register({ userID, password, email, displayName }) {
    const hasExistingSession = !!await Cookie.get("authSession");
    if (hasExistingSession) {
      throw {
        message: "You are already logged in",
        code: "EXISTING_SESSION",
        statusCode: 400,
      };
    }
    const res = Agent.dispatch({
      type: "AuthRegisterAction",
      userID,
      password,
      email,
      displayName,
    });
    return res;
  }
  return Register;
};
