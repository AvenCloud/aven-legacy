const ZEquals = {
  is: input => {
    return input.type === "ZEquals";
  },
  get: (input, docs) => {
    if (input.type !== "ZEquals") {
      return null;
    }
    return true;
  },
  compute: (input, computeCb) => {
    console.log("comput", input);
  },
  validate: (input, type) => {
    return false;
  }
};

export default ZEquals;
