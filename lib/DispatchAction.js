var _this=this;var _AuthRegisterAction=require("./AuthRegisterAction");var _AuthRegisterAction2=_interopRequireDefault(_AuthRegisterAction);
var _AuthVerifyAction=require("./AuthVerifyAction");var _AuthVerifyAction2=_interopRequireDefault(_AuthVerifyAction);
var _EmailRecieveAction=require("./EmailRecieveAction");var _EmailRecieveAction2=_interopRequireDefault(_EmailRecieveAction);function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}

var DataActions={
EmailRecieveAction:_EmailRecieveAction2.default,
AuthRegisterAction:_AuthRegisterAction2.default,
AuthVerifyAction:_AuthVerifyAction2.default};


module.exports=function _callee(action){return regeneratorRuntime.async(function _callee$(_context){while(1){switch(_context.prev=_context.next){case 0:if(!
DataActions[action.type]){_context.next=4;break;}_context.next=3;return regeneratorRuntime.awrap(
DataActions[action.type](action));case 3:return _context.abrupt("return",_context.sent);case 4:throw(

new Error("Action not identified"));case 5:case"end":return _context.stop();}}},null,_this);};