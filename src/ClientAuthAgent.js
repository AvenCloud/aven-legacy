const ClientAuthAgent = agent => {
  const setSession = (authUserID, authSession) => {};
  return {
    ...agent,
    setSession,
  };
};

module.exports = ClientAuthAgent;
