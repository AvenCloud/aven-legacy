const ZString = {
  is: input => typeof input === "string" || input.type === "ZString",
  get: input => {
    if (typeof input === "string") {
      return input;
    } else if (input.type === "ZString") {
      return input.value;
    } else {
      return null;
    }
  },
  validate: (input, type): boolean => {
    const matchingString = ZString.get(type);
    const doesMatch = ZString.get(input) === matchingString;
    if (matchingString != null && !doesMatch) {
      return `does not match "${matchingString}"`;
    }
    if (!ZString.is(input)) {
      return "is not a string";
    }
    return false;
  }
};

export default ZString;
