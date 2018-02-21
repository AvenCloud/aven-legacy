async function fetchRecord(agent, action) {
  const record = await agent.dispatch({
    ...action,
    type: "GetRecordAction",
  });
  if (!record) {
    return record;
  }
  const doc = await agent.dispatch({
    ...action,
    type: "GetDocAction",
    docID: record.docID,
  });
  return doc;
}

const HelperAgent = async agent => {
  async function dispatch(action) {
    switch (action.type) {
      case "FetchRecordAction":
        return await fetchRecord(agent, action);
      default:
        return await agent.dispatch(action);
    }
  }
  return {
    ...agent,
    dispatch,
  };
};

module.exports = HelperAgent;
