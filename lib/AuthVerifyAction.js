Object.defineProperty(exports,"__esModule",{value:true});var _DatabaseService=require("./DatabaseService");var _DatabaseService2=_interopRequireDefault(_DatabaseService);function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}exports.default=

function AuthRegisterAction(action){var data;return regeneratorRuntime.async(function AuthRegisterAction$(_context){while(1){switch(_context.prev=_context.next){case 0:_context.next=2;return regeneratorRuntime.awrap(
_DatabaseService2.default.getDoc(action.username));case 2:data=_context.sent;
console.log(data,action);return _context.abrupt("return",
{wat:true});case 5:case"end":return _context.stop();}}},null,this);};