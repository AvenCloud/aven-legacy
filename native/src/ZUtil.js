/*
 * @flow
 */

// Single types:
type ZLiteral = string | number | boolean;
type ZStringDef = { type: "string" };
type ZNumberDef = { type: "number" };
type ZBooleanDef = { type: "boolean" };
type ZSingleDef = ZStringDef | ZBooleanDef | ZNumberDef | ZLiteral;

// Intermediate type (this is not actually a ZType by itself)
type ZTypeMap = { [key: string]: ZTypeDef };

// Composite Types
type ZListDef = { type: "list", subtype: ZTypeDef };
// type ZTupleDef = {type: 'tuple', subtypes: Array<ZTypeDef>} // lets ignore this for now because the UI is inconvenient
type ZObjectDef = { type: "object", map: ZTypeMap };
type ZOrDef = Array<ZTypeDef>;

// Main type
type ZTypeDef = ZSingleDef | ZListDef | ZObjectDef | ZOrDef;

export function isTypeLiteral(typeDef: ZTypeDef) {
  return typeof typeDef === "string" ||
    typeof typeDef === "boolean" ||
    typeof typeDef === "number";
}

export function isTypeOrOfLiterals(typeDef) {
  if (!typeDef instanceof Array) {
    return false;
  }
  let hasOnlyLiterals = true;
  typeDef.forEach(t => {
    if (!isTypeLiteral(t)) {
      hasOnlyLiterals = false;
    }
  });
  return hasOnlyLiterals;
}



/*import {
  ZAdd, ZConnect, ZRef, ZNumber, ZAction, ZSetDocAction
} from 'ZUtil'

class Foo extends Component {
  static docs = {
    pressCount: ZNumber(0),
    qty: ZNumber(0),
  };
  render() {
    return (
      <div onPress={() => {
        this.props.dispatch(ZSetDocAction('pressCount', ZAdd(ZRef('pressCount'), 1));
      }}>
        Qty: {this.props.docs.qty}
        {this.props.docs.pressCount}
      </div>
    );
  }
}

ZConnect(Foo);
*/