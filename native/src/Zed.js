/*
 * @flow
 */

// Single types:
type ZLiteral = string | number | boolean;
type ZStringDef = { type: "ZString", value: string };
type ZNumberDef = { type: "ZNumber", value: number };
type ZBooleanDef = { type: "ZBoolean", value: boolean };
type ZSingleDef = ZStringDef | ZBooleanDef | ZNumberDef | ZLiteral;

// Intermediate types (this is not actually a ZType by itself)
type ZMap = { [key: string]: ZData };
type ZSet = Array<ZData>;
type ZAddressDef = { type: "ZAddress", address: Array<string | number> };

// Composite Types
type ZListDef = {
  type: "ZList",
  items: ZSet,
  allType: ?ZData,
  tupleType: ?ZSet
};
// type ZTupleDef = {type: 'ZTupleSpec', subtypes: ZSet} // lets ignore this for now because the UI is inconvenient
type ZObjectDef = { type: "ZObject", typeMap: ?ZMap, items: ZMap };
type ZOrDef = { type: "ZOr", options: ZSet };

// Main type
type ZData = ZSingleDef | ZListDef | ZObjectDef | ZOrDef;

type ZAddressListener = ZAddress => void;

const VALID_TYPES = [
  "ZOr",
  "ZList",
  "ZString",
  "ZNumber",
  "ZBoolean",
  "ZObject"
];

export function ZObject(items: ZMap, typeMap: ZMap): ZObjectDef {
  return { type: "ZObject", items, typeMap };
}
export function ZList(items: ZSet, allType: ZData, tupleType: ZSet): ZListDef {
  return { type: "ZList", items, allType, tupleType };
}

export function ZAddress(address): ZAddress {
  return { type: "ZAddress", address };
}

export function ZString(value: string): ZStringDef {
  return { type: "ZString", value };
}

export function ZNumber(value: number): ZNumberDef {
  return { type: "ZNumber", value };
}

export function ZBoolean(value: boolean): ZBooleanDef {
  return { type: "ZBoolean", value };
}

export function ZEquals(a, b): ZEquals {
  return { type: "ZEquals", a, b };
}

export function ZSum(a, b): ZSum {
  return { type: "ZSum", a, b };
}

function genPrimitiveType(typeName, jsPrimitive) {
  return {
    match: input => {
      return input.type === typeName && typeof input.value === jsPrimitive;
    },
    compute: (store, input) => {
      return input;
    }
  };
}

const BUILT_IN_STUFF = {
  ZString: genPrimitiveType("ZString", "string"),
  ZBoolean: genPrimitiveType("ZBoolean", "boolean"),
  ZNumber: genPrimitiveType("ZNumber", "number"),

  ZAddress: {
    compute: (store, input) => {
      return store.compute(store.data[input.address]);
    }
  },
  ZEquals: {
    compute: (store, input) => {
      const a = store.compute(input.a);
      const b = store.compute(input.b);
      return ZBoolean(a.value === b.value);
    }
  },
  ZSum: {
    compute: (store, input) => {
      const a = store.compute(input.a);
      const b = store.compute(input.b);
      return ZNumber(a.value + b.value);
    }
  }
};

export class Store {
  data: ZMap = {};
  constructor(initialData: ZMap) {
    this.data = initialData;
  }
  compute(doc: ZData) {
    const docType = doc.type;

    const builtIn = BUILT_IN_STUFF[docType];
    if (builtIn) {
      return builtIn.compute(this, doc);
    }
    throw new Error("Unrecognized type");
  }
  match(input, expectedType) {
    const builtIn = BUILT_IN_STUFF[expectedType];
    if (builtIn) {
      return builtIn.match(input);
    }
    throw new Error("Unrecognized type");
  }
}
