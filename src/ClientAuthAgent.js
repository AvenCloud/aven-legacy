const ClientAuthAgent = (agent, opts) => {
  const cache = (opts && opts.cache) || { records: {}, docs: {} };
  let session = null;
  const setSession = (authUser, authSession) => {
    if (!authUser || !authSession) {
      session = null;
      return;
    }
    session = { authUser, authSession };
  };
  const dumpCache = () => cache;
  const dispatch = async action => {
    let actionWithAuth = action;
    if (
      session &&
      action.authUser === undefined &&
      action.authSession === undefined
    ) {
      const { authSession, authUser } = session;
      actionWithAuth = { ...action, authSession, authUser };
    }

    if (action.type === "GetSessionAction") {
      return session;
    }
    if (action.type === "AuthLoginAction") {
      const loginRes = await agent.dispatch(action);
      if (loginRes && loginRes.userID && loginRes.session) {
        setSession(loginRes.userID, loginRes.session);
      }
      return loginRes;
    }
    if (action.type === "AuthLogoutAction" && session) {
      const logoutRes = await agent.dispatch({
        type: "AuthLogoutAction",
        authSession: session.authSession,
      });
      setSession(null, null);
      return logoutRes;
    }
    if (action.type === "GetDocAction") {
      const hasCached = !!cache.docs[action.docID];
      if (hasCached) {
        return cache.docs[action.docID];
      }
      const result = await agent.dispatch(actionWithAuth);
      if (!hasCached && result && result.value !== undefined) {
        cache.docs[action.docID] = result;
      }
      return result;
    }
    if (action.type === "GetRecordAction") {
      const result = await agent.dispatch(actionWithAuth);
      const hasCached = !!cache.records[action.recordID];
      if (!hasCached && result) {
        cache.records[action.recordID] = result;
      }
      return result;
    }

    return await agent.dispatch(actionWithAuth);
  };

  return {
    ...agent,
    setSession,
    dispatch,
    dumpCache,
  };
};

module.exports = ClientAuthAgent;
