const createDispatcher = require("./Dispatch");

const RootAgent = async infra => {
  const dispatch = createDispatcher(infra);

  return {
    dispatch,
  };
};

module.exports = RootAgent;
