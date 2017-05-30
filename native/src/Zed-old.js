// export function isLiteralType(typeDef: ZData): boolean {
//   return (
//     typeof typeDef === "string" ||
//     typeof typeDef === "boolean" ||
//     typeof typeDef === "number"
//   );
// }

// export function isTypeMatch(value: ZData, type: ZData): boolean {
//   if (isLiteralType(type) && value === type) {
//     return true;
//   }
//   return false;
// }

// export function ZToJSON(data: ZData): mixed {
//   return { IS_SERIALIZED_ZED: true, data };
// }
// export function JSONToZ(json: mixed): ?ZData {
//   if (json == null) {
//     return json;
//   } else if (json instanceof Array) {
//     const zDataSet = json.map(jsonChild => {
//       return JSONToZ(jsonChild);
//     });
//     return { type: "list", items: zDataSet };
//   }
//   if (json.IS_SERIALIZED_ZED) {
//     return json.data;
//   }
//   const zDataMap = {};
//   Object.keys(json).map(name => {
//     zDataMap[name] = JSONToZ(json[name]);
//   });
//   return { type: "object", items: zDataMap };
// }

// function getMutationValidationErrorMessage(state, address, newValue) {
//   // todo
// }

// export function createStore() {
//   const state = {};
//   const listeners = [];

//   function mutate(address: ZAddress, value: ZData) {
//     const validationErrorMessage = getMutationValidationErrorMessage(
//       state,
//       address,
//       value
//     );
//     if (validationErrorMessage) {
//       throw new Error("Invalid data. " + validationErrorMessage);
//     }
//     if (typeof address === "string") {
//       address = [address];
//     }
//     if (!address instanceof Array) {
//       throw new Error("Unknown address type!");
//     }

//     emitChange(address);
//   }

//   function addListener(stateAddressListener: ZAddressListener) {
//     listeners.push(stateAddressListener);
//     return {
//       remove: () => listeners.splice(listeners.indexOf(stateAddressListener), 1)
//     };
//   }

//   function emitChange(address) {
//     listeners.forEach(listener => {
//       listener(address);
//     });
//   }

//   const store = {
//     state,
//     mutate,
//     addListener
//   };

//   return store;
// }

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

import ZedTypes from "./ZedTypes";

export function getBuiltInType(input) {
  const matchBuiltInZedType = Object.keys(ZedTypes).find(
    typeName => input.type === typeName
  );
  if (matchBuiltInZedType) {
    return ZedTypes[matchBuiltInZedType];
  }
  return null;
}

export function validate(input, type) {
  const definedType = type && getBuiltInType(type);
  if (definedType) {
    return definedType.validate(input, type);
  }
  const impliedType = getBuiltInType(input);
  if (impliedType) {
    return impliedType.validate(input);
  }

  if (type == null) {
    // I suppose type is not meant to match anything, and there is no error..
    return false;
  }
  return "is of an unknown type";
}

export function compute(docs, address) {
  const doc = docs[address];
  const validationError = validate(doc);
  if (validationError) {
    return { validationError, doc };
  }
  const t = getBuiltInType(doc);
  if (t) {
    return t.compute(doc, docs);
  }
  return null;
}

export function get(docs, address) {
  const computed = compute(docs, address);

  // now convert it to json mmkay
  return false;
}
