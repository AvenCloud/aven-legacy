/*
 * @flow
 */

// Single types:
type ZLiteral = string | number | boolean;
type ZStringDef = { type: "ZStringSpec", value: string };
type ZNumberDef = { type: "ZNumberSpec", value: number };
type ZBooleanDef = { type: "ZBooleanSpec", value: boolean };
type ZSingleDef = ZStringDef | ZBooleanDef | ZNumberDef | ZLiteral;

// Intermediate types (this is not actually a ZType by itself)
type ZMap = { [key: string]: ZData };
type ZSet = Array<ZData>;
type ZAddressDef = { type: "ZAddress", address: Array<string | number> };

// Composite Types
type ZListDef = {
  type: "ZListSpec",
  items: ZSet,
  allType: ?ZData,
  tupleType: ?ZSet
};
// type ZTupleDef = {type: 'ZTupleSpec', subtypes: ZSet} // lets ignore this for now because the UI is inconvenient
type ZObjectDef = { type: "ZObjectSpec", typeMap: ?ZMap, items: ZMap };
type ZOrDef = { type: "ZOrSpec", options: ZSet };

// Main type
type ZData = ZSingleDef | ZListDef | ZObjectDef | ZOrDef;

type ZAddressListener = ZAddress => void;

const VALID_TYPES = [
  "ZOrSpec",
  "ZListSpec",
  "ZStringSpec",
  "ZNumberSpec",
  "ZBooleanSpec",
  "ZObjectSpec"
];

export function ZObject(items: ZMap, typeMap: ZMap): ZObjectDef {
  return { type: "ZObjectSpec", items, typeMap };
}
export function ZList(items: ZSet, allType: ZData, tupleType: ZSet): ZListDef {
  return { type: "ZListSpec", items, allType, tupleType };
}

export function ZAddress(...address): ZAddress {
  return { type: "ZAddress", address };
}

export function isLiteralType(typeDef: ZData): boolean {
  return (
    typeof typeDef === "string" ||
    typeof typeDef === "boolean" ||
    typeof typeDef === "number"
  );
}

export function isTypeMatch(value: ZData, type: ZData): boolean {
  if (isLiteralType(type) && value === type) {
    return true;
  }
  return false;
}

export function ZToJSON(data: ZData): mixed {
  return { IS_SERIALIZED_ZED: true, data };
}
export function JSONToZ(json: mixed): ?ZData {
  if (json == null) {
    return json;
  } else if (json instanceof Array) {
    const zDataSet = json.map(jsonChild => {
      return JSONToZ(jsonChild);
    });
    return { type: "list", items: zDataSet };
  }
  if (json.IS_SERIALIZED_ZED) {
    return json.data;
  }
  const zDataMap = {};
  Object.keys(json).map(name => {
    zDataMap[name] = JSONToZ(json[name]);
  });
  return { type: "object", items: zDataMap };
}

function getMutationValidationErrorMessage(state, address, newValue) {
  // todo
}

export function createStore() {
  const state = {};
  const listeners = [];

  function mutate(address: ZAddress, value: ZData) {
    const validationErrorMessage = getMutationValidationErrorMessage(
      state,
      address,
      value
    );
    if (validationErrorMessage) {
      throw new Error("Invalid data. " + validationErrorMessage);
    }
    if (typeof address === "string") {
      address = [address];
    }
    if (!address instanceof Array) {
      throw new Error("Unknown address type!");
    }

    emitChange(address);
  }

  function addListener(stateAddressListener: ZAddressListener) {
    listeners.push(stateAddressListener);
    return {
      remove: () => listeners.splice(listeners.indexOf(stateAddressListener), 1)
    };
  }

  function emitChange(address) {
    listeners.forEach(listener => {
      listener(address);
    });
  }

  const store = {
    state,
    mutate,
    addListener
  };

  return store;
}

/*import {
  ZAdd, ZConnect, ZAddress, ZNumber, ZAction, ZSetDocAction
} from 'ZUtil'

class Foo extends Component {
  static docs = {
    pressCount: ZNumber(0),
    qty: ZNumber(0),
  };
  render() {
    return (
      <div onPress={() => {
        this.props.dispatch(ZSetDocAction('pressCount', ZAdd(ZAddress('pressCount'), 1));
      }}>
        Qty: {this.props.docs.qty}
        {this.props.docs.pressCount}
      </div>
    );
  }
}

ZConnect(Foo);
*/
