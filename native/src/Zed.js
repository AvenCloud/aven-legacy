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

export function ZOr(...options): ZOrDef {
  return { __zType: "ZOr", options };
}

function genPrimitiveType(typeName, jsPrimitive) {
  return {
    compute: (store, input) => {
      return { ...input, dependencies: [] };
    },
    validate: (store, input, expectedType) => {
      if (typeName !== expectedType.__zType) {
        return `is not a ${expectedType.__zType}`;
      }
      if (input.__zType !== expectedType.__zType) {
        return `is not a ${expectedType.__zType}`;
      }
      if (expectedType.value != null && expectedType.value !== input.value) {
        return `does not match '${expectedType.value}'`;
      }
      if (input.value != null && typeof input.value !== jsPrimitive) {
        return `is not a ${jsPrimitive}`;
      }
      return null;
    }
  };
}

const NativeTypes = {
  ZString: genPrimitiveType("ZString", "string"),
  ZBoolean: genPrimitiveType("ZBoolean", "boolean"),
  ZNumber: genPrimitiveType("ZNumber", "number"),

  ZAddress: {
    compute: (store, input) => {
      const computedChild = store.compute(store.data[input.address]);
      const dependencies = computedChild.dependencies
        ? [...computedChild.dependencies]
        : [];
      dependencies.push(input);
      return { ...computedChild, dependencies };
    },
    validate: (store, input, expectedType) => {
      return store.validate(store.data[input.address], expectedType);
    }
  },
  ZEquals: {
    compute: (store, input) => {
      const a = store.compute(input.a);
      const b = store.compute(input.b);
      const computedEquality = ZBoolean(a.value === b.value);
      return {
        ...computedEquality,
        dependencies: [...a.dependencies, ...b.dependencies]
      };
    },
    validate: (store, input, expectedType) => {
      return null;
    }
  },
  ZSum: {
    compute: (store, input) => {
      const a = store.compute(input.a);
      const b = store.compute(input.b);
      let computedNumber = null;
      if (typeof a.value === "number" && typeof b.value === "number") {
        computedNumber = ZNumber(a.value + b.value);
      }
      return {
        value: null,
        ...computedNumber,
        dependencies: [...a.dependencies, ...b.dependencies]
      };
    },
    validate: (store, input, expectedType) => {
      const aValidationError = store.validate(input.a, ZNumber());
      const bValidationError = store.validate(input.b, ZNumber());
      if (aValidationError) {
        return "cannot a non-number to something";
      }
      if (bValidationError) {
        return "cannot add this to a non-number";
      }
      return null;
    }
  },
  ZOr: {
    compute: (store, input) => input,
    validate: (store, input, expectedType) => {
      // This should not happen and be handled directly by store.validate
      return null;
    }
  },
  ZObject: {},
  ZList: {}
  //ZSwitch: {}, // ?
};

export class Store {
  data: ZMap = {};
  listeners: { [key: string]: ZDataListener } = {};
  constructor(initialData: ZMap) {
    this.data = initialData;
  }
  watch(address: ZAddress, handler: ZDataListener, onRemove: ?Function) {
    const addy = address.address;
    const listeners = this.listeners[addy] || (this.listeners[addy] = []);
    listeners.push(handler);
    handler(this.data[addy]);
    return {
      remove: () => {
        const listeners = this.listeners[addy] || (this.listeners[addy] = []);
        const handlerIndex = listeners.indexOf(handler);
        handlerIndex !== -1 && listeners.splice(handlerIndex, 1);
        onRemove && onRemove();
      }
    };
  }
  watchComputed(
    address: ZAddress,
    handler: ZDataListener,
    onRemove: ?Function
  ) {
    let childWatches = [];
    return this.watch(
      address,
      watchedData => {
        let handleChange = () => {};
        const computedData = this.compute(watchedData);
        let lastData = computedData;
        computedData.dependencies &&
          computedData.dependencies.forEach(dependency => {
            childWatches.push(
              this.watch(dependency, () => {
                const computedData = this.compute(watchedData);
                if (computedData.value !== lastData.value) {
                  handleChange(computedData);
                  lastData = computedData;
                }
              })
            );
          });
        handler(computedData);
        handleChange = handler;
      },
      () => {
        childWatches.forEach(childWatch => childWatch.remove());
        childWatches = [];
        onRemove && onRemove();
      }
    );
  }
  mutate(address: ZAddress, newDoc: ZData) {
    this.data[address.address] = newDoc;
    if (this.listeners[address.address]) {
      this.listeners[address.address].forEach(listener => listener(newDoc));
    }
  }
  compute(doc: ZData) {
    if (doc == null) {
      return {};
    }
    const nativeType = NativeTypes[doc.__zType];
    if (nativeType) {
      return nativeType.compute(this, doc);
    }
    throw new Error("Unrecognized __zType");
  }
  validate(doc: ZData, expectedType: ZData): ?string {
    const computedExpectedType = this.compute(expectedType);
    if (computedExpectedType && computedExpectedType.__zType === "ZOr") {
      const validations = computedExpectedType.options.map(optionType => {
        return this.validate(doc, optionType);
      });
      if (validations.indexOf(null) !== -1) {
        return null;
      }
      return validations.join(" and ");
    }
    const nativeType = NativeTypes[doc.__zType];
    if (nativeType) {
      return nativeType.validate(this, doc, computedExpectedType);
    }
    return `cannot recognize type '${doc.__zType}'`;
  }
}
