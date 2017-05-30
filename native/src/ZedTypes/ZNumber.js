const ZNumber = {
  is: input => {
    return typeof input === "number" || input.type === "ZNumber";
  },
  get: input => {
    if (typeof input === "number") {
      return input;
    } else if (input.type === "ZNumber") {
      return input.value;
    } else {
      return null;
    }
  },
  validate: (input, type) => {
    const matchingNumber = ZNumber.get(type);
    const doesMatch = ZNumber.get(input) === matchingNumber;
    if (matchingNumber != null && !doesMatch) {
      if (!ZNumber.is(input)) {
        return `is not a number equal to ${matchingNumber}`;
      }
      return `does not equal ${matchingNumber}`;
    }
    if (!ZNumber.is(input)) {
      return "is not a number";
    }
    return false;
  }
};

export default ZNumber;
