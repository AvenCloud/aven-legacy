({ Agent }) => {
  async function GetSession() {
    return await Agent.dispatch({ type: "GetSessionAction" });
  }

  return GetSession;
};
