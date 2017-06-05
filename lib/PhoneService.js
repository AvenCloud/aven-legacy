Object.defineProperty(exports,"__esModule",{value:true});exports.








sendSMS=sendSMS;var _Configuration=require("./Configuration");var _Configuration2=_interopRequireDefault(_Configuration);function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}var fetch=require("node-fetch");var AuthHeader="Basic "+new Buffer(_Configuration2.default.secrets.plivo_id+":"+_Configuration2.default.secrets.plivo_key).toString("base64");function sendSMS(destNumber,textBody){var res,_json,json;return regeneratorRuntime.async(function sendSMS$(_context){while(1){switch(_context.prev=_context.next){case 0:_context.next=2;return regeneratorRuntime.awrap(
fetch(
"https://api.plivo.com/v1/Account/"+
_Configuration2.default.secrets.plivo_id+
"/Message/",
{
method:"post",
headers:{
Authorization:AuthHeader,
"Content-Type":"application/json"},

body:JSON.stringify({
src:_Configuration2.default.secrets.from_phone,
dst:destNumber,
text:textBody})}));case 2:res=_context.sent;if(!(



(""+res.status)[0]!=="2")){_context.next=9;break;}_context.next=6;return regeneratorRuntime.awrap(
res.json());case 6:_json=_context.sent;
_json.status=res.status;throw(
_json);case 9:_context.next=11;return regeneratorRuntime.awrap(

res.json());case 11:json=_context.sent;return _context.abrupt("return",
json);case 13:case"end":return _context.stop();}}},null,this);}