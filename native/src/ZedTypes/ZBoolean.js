const ZBoolean = {
  is: input => typeof input === "boolean" || input.type === "ZBoolean",
  get: input => {
    if (typeof input === "boolean") {
      return input;
    } else if (input.type === "ZBoolean") {
      return input.value;
    } else {
      return null;
    }
  },
  validate: (input, type): boolean => {
    const matchingBool = ZBoolean.get(type);
    const doesMatch = ZBoolean.get(input) === matchingBool;
    if (matchingBool != null && !doesMatch) {
      return `does not match "${matchingBool}"`;
    }
    if (!ZBoolean.is(input)) {
      return "is not a boolean";
    }
    return false;
  }
};

export default ZBoolean;
