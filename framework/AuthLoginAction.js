({ Agent, Cookie }) => {
  async function Login({ userID, password }) {
    const loginRes = await Agent.dispatch({
      type: "AuthLoginAction",
      userID,
      password,
    });
    if (loginRes && loginRes.session) {
      await Cookie.set("authUserID", loginRes.userID);
      await Cookie.set("authSession", loginRes.session);
    }
    return loginRes;
  }
  return Login;
};
