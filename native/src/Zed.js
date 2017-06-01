/*
 * @flow
 */

// Single types:
type ZStringDef = { __zType: "ZString", value: string };
type ZNumberDef = { __zType: "ZNumber", value: number };
type ZBooleanDef = { __zType: "ZBoolean", value: boolean };
type ZSingleDef = ZStringDef | ZBooleanDef | ZNumberDef;

// Intermediate types (this is not actually a ZType by itself)
type ZMap = { [key: string]: ZData };
type ZSet = Array<ZData>;
type ZAddressDef = { __zType: "ZAddress", address: string };

// Composite Types
type ZListDef = {
  __zType: "ZList",
  items: ZSet,
  allType: ?ZData,
  tupleType: ?ZSet
};
// type ZTupleDef = { __zType: 'ZTupleSpec', subtypes: ZSet} // lets ignore this for now because the UI is inconvenient
type ZObjectDef = { __zType: "ZObject", typeMap: ?ZMap, items: ZMap };
type ZOrDef = { __zType: "ZOr", options: ZSet };

// Main type
type ZData = ZSingleDef | ZListDef | ZObjectDef | ZOrDef;

type ZAddressListener = ZAddress => void;
type ZDataListener = ZData => void;

const VALID_TYPES = [
  "ZOr",
  "ZList",
  "ZString",
  "ZNumber",
  "ZBoolean",
  "ZObject"
];

export function ZObject(items: ZMap, typeMap: ZMap): ZObjectDef {
  return { __zType: "ZObject", items, typeMap };
}
export function ZList(items: ZSet, allType: ZData, tupleType: ZSet): ZListDef {
  return { __zType: "ZList", items, allType, tupleType };
}

export function ZAddress(address: string): ZAddress {
  return { __zType: "ZAddress", address };
}

export function ZString(value: string): ZStringDef {
  return { __zType: "ZString", value };
}

export function ZNumber(value: number): ZNumberDef {
  return { __zType: "ZNumber", value };
}

export function ZBoolean(value: boolean): ZBooleanDef {
  return { __zType: "ZBoolean", value };
}

export function ZEquals(a, b): ZEquals {
  return { __zType: "ZEquals", a, b };
}

export function ZSum(a, b): ZSum {
  return { __zType: "ZSum", a, b };
}

function genPrimitiveType(typeName, jsPrimitive) {
  return {
    validate: (store, input, expectedType) => {
      if (typeName !== expectedType.__zType) {
        return `value is not a ${expectedType.__zType}`;
      }
      if (typeof input.value !== jsPrimitive) {
        return `value is not a ${jsPrimitive}`;
      }
      return null;
    },
    compute: (store, input) => {
      return input;
    }
  };
}

const NativeTypes = {
  ZString: genPrimitiveType("ZString", "string"),
  ZBoolean: genPrimitiveType("ZBoolean", "boolean"),
  ZNumber: genPrimitiveType("ZNumber", "number"),

  ZAddress: {
    compute: (store, input) => {
      return store.compute(store.data[input.address]);
    },
    validate: (store, input, expectedType) => {
      return store.validate(store.data[input.address], expectedType);
    }
  },
  ZEquals: {
    compute: (store, input) => {
      const a = store.compute(input.a);
      const b = store.compute(input.b);
      return ZBoolean(a.value === b.value);
    },
    validate: (store, input, expectedType) => {
      return null;
    }
  },
  ZSum: {
    compute: (store, input) => {
      const a = store.compute(input.a);
      const b = store.compute(input.b);
      return ZNumber(a.value + b.value);
    }
  },
  ZObject: {},
  ZOr: {},
  ZList: {}
  //ZSwitch: {}, // ?
};

export class Store {
  data: ZMap = {};
  listeners: { [key: string]: ZDataListener } = {};
  constructor(initialData: ZMap) {
    this.data = initialData;
  }
  watch(address: ZAddress, handler: ZDataListener) {
    const addy = address.address;
    const listeners = this.listeners[addy] || (this.listeners[addy] = []);
    listeners.push(handler);
    handler(this.data[addy]);
    return {
      remove: () => {
        const listeners = this.listeners[addy] || (this.listeners[addy] = []);
        const handlerIndex = listeners.indexOf(handler);
        handlerIndex !== -1 && listeners.splice(handlerIndex, 1);
      }
    };
  }
  mutate(address: ZAddress, newDoc: ZData) {
    this.data[address.address] = newDoc;
    if (this.listeners[address.address]) {
      this.listeners[address.address].forEach(listener => listener(newDoc));
    }
  }
  compute(doc: ZData) {
    const type = NativeTypes[doc.__zType];
    if (type) {
      return type.compute(this, doc);
    }
    throw new Error("Unrecognized __zType");
  }
  validate(doc: ZData, expectedType: ZData): ?string {
    const computedExpectedType = this.compute(expectedType);
    const type = NativeTypes[doc.__zType];
    if (type) {
      return type.validate(this, doc, computedExpectedType);
    }
    return "__zType is not recognized";
  }
}
