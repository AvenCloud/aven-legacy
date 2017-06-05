Object.defineProperty(exports,"__esModule",{value:true});var _DatabaseService=require("./DatabaseService");var _DatabaseService2=_interopRequireDefault(_DatabaseService);function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}exports.default=

function EmailRecieveAction(action){return regeneratorRuntime.async(function EmailRecieveAction$(_context){while(1){switch(_context.prev=_context.next){case 0:_context.next=2;return regeneratorRuntime.awrap(
_DatabaseService2.default.createDoc("Email-"+Date.now(),action.data));case 2:return _context.abrupt("return",
{});case 3:case"end":return _context.stop();}}},null,this);};