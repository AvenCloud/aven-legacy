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
    await Cookie.set("authUserID", pendingRegistration.userID);
    await Cookie.set("authSession", loginRes.session);
  }
  return Register;
};
