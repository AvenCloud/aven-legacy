Object.defineProperty(exports,"__esModule",{value:true});exports.


sendEmail=sendEmail;var _Configuration=require("./Configuration");var _Configuration2=_interopRequireDefault(_Configuration);function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}var fetch=require("node-fetch");function sendEmail(destEmail,subject,textBody){var sendData,body,res,json;return regeneratorRuntime.async(function sendEmail$(_context){while(1){switch(_context.prev=_context.next){case 0:
sendData={
personalizations:[{to:[{email:destEmail}]}],
from:{email:_Configuration2.default.secrets.from_email},
subject:subject,
content:[{type:"text/plain",value:textBody}]};

body=JSON.stringify(sendData);
console.log(body,"WOAAAH");_context.next=5;return regeneratorRuntime.awrap(
fetch("https://api.sendgrid.com/v3/mail/send",{
method:"post",
headers:{
Authorization:"Bearer "+_Configuration2.default.secrets.sendgrid_key,
"Content-Type":"application/json"},

body:body}));case 5:res=_context.sent;if(!(

(""+res.status)[0]!=="2")){_context.next=11;break;}_context.next=9;return regeneratorRuntime.awrap(
res.text());case 9:json=_context.sent;throw(
{
error:"EmailError",
status:res.status,
details:json});case 11:return _context.abrupt("return",


{});case 12:case"end":return _context.stop();}}},null,this);}