const ZEquals = {
  is: input => {
    return input.type === "ZEquals";
  },
  get: input => {
    if (input.type !== "ZEquals") {
      return null;
    }
    return true;
  },
  validate: (input, type) => {
    return false;
  }
};

export default ZEquals;
