({ Agent, Cookie }) => {
  async function Verify({ code, userID, authID }) {
    const res = Agent.dispatch({
      type: "AuthVerifyAction",
      code,
      userID,
      authID,
    });
    return res;
  }
  return Verify;
};
