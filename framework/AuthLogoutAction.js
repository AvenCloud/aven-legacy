({ Agent, Cookie }) => {
  async function Logout() {
    const res = Agent.dispatch({
      type: "AuthLogoutAction",
      // authSession is optional here because the ClientAuthAgent will inject the current session.
    });
    await Cookie.set("authUserID", null);
    await Cookie.set("authSession", null);
    return res;
  }
  return Logout;
};
