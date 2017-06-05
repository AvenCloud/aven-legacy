Object.defineProperty(exports,"__esModule",{value:true});var _DatabaseService=require("./DatabaseService");var _DatabaseService2=_interopRequireDefault(_DatabaseService);
var _PhoneService=require("./PhoneService");
var _EmailService=require("./EmailService");function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}

var validator=require("validator");

var looksLikeAnEmail=function looksLikeAnEmail(str){return(
typeof str==="string"&&str.length>5&&str.split("@").length===2);};

var looksLikeAPhoneNumber=function looksLikeAPhoneNumber(str){
if(typeof str!=="string")return false;
var newStr=str.
replace(/-/g,"").
replace(/\+/g,"").
replace(/\(/g,"").
replace(/\)/g,"").
replace(/ /g,"");
return validator.isNumeric(newStr);
};exports.default=

function AuthRegisterAction(action){var user,email,phone;return regeneratorRuntime.async(function AuthRegisterAction$(_context){while(1){switch(_context.prev=_context.next){case 0:
user={
emailVerification:null,
phoneVerification:null};

email=looksLikeAnEmail(action.email)?
action.email:
looksLikeAnEmail(action.email_or_phone)?action.email_or_phone:null;
phone=looksLikeAPhoneNumber(action.phone)?
action.phone:
looksLikeAPhoneNumber(action.email_or_phone)?
action.email_or_phone:
null;if(!
email){_context.next=7;break;}
user.emailVerification={
verificationTime:Date.now()/1000,
email:email,
code:Math.floor(Math.random()*10000)};_context.next=12;break;case 7:if(!

phone){_context.next=11;break;}
user.phoneVerification={
verificationTime:Date.now()/1000,
phone:phone,
code:Math.floor(Math.random()*10000)};_context.next=12;break;case 11:throw(


"No valid email address or phone number!");case 12:_context.prev=12;_context.next=15;return regeneratorRuntime.awrap(


_DatabaseService2.default.createDoc(action.name,user));case 15:_context.next=22;break;case 17:_context.prev=17;_context.t0=_context["catch"](12);if(!(

_context.t0.constraint==="primarykey")){_context.next=21;break;}throw(
{
detail:"A user with the name '"+action.name+"' already exists.",
code:"DUPE_USER"});case 21:throw(


_context.t0.detail);case 22:if(!

user.emailVerification){_context.next=25;break;}_context.next=25;return regeneratorRuntime.awrap(
(0,_EmailService.sendEmail)(
user.emailVerification.email,"welcome and verification","your code is "+

user.emailVerification.code));case 25:if(!


user.phoneVerification){_context.next=28;break;}_context.next=28;return regeneratorRuntime.awrap(
(0,_PhoneService.sendSMS)(
user.phoneVerification.phone,"your code is "+
user.phoneVerification.code));case 28:return _context.abrupt("return",


{name:action.name});case 29:case"end":return _context.stop();}}},null,this,[[12,17]]);};