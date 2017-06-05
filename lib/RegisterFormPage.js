Object.defineProperty(exports,"__esModule",{value:true});var _jsxFileName="src/RegisterFormPage.js";var _CreateSmallFormPage=require("./CreateSmallFormPage");var _CreateSmallFormPage2=_interopRequireDefault(_CreateSmallFormPage);
var _react=require("react");var _react2=_interopRequireDefault(_react);function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}

var RegisterFormPage=(0,_CreateSmallFormPage2.default)({
submitButtonLabel:"Verify and Join Aven",
title:"Register",
heading:"Great to meet you!",
subheadingText:"We're excited to build great things together",

successNavigationAction:{uri:"/auth/verify"},
inputs:[
{
type:"text",
name:"username",
label:"Username",
rightLabel:function rightLabel(input){
if(input&&input.length>2){
return input+".aven.io";
}
return _react2.default.createElement("span",{style:{color:"#777"},__source:{fileName:_jsxFileName,lineNumber:20}},"you.aven.io");
},
placeholder:"What is your personal shortname/url?"},

{
name:"email_or_phone",
placeholder:"How can we stay in touch?",
label:"Email or Phone Number",
type:"email-phone-signup"}],


getActionForInput:function getActionForInput(input){return{
type:"AuthRegisterAction",
name:input.username,
email_or_phone:input.email_or_phone,

email:input.email,
phone:input.phone};},

validate:function validate(state){
if(!state.username){
return"Must provide the _username_";
}
if(!state.username){
return"Must provide either a _Phone Number_ or an _Email_";
}
return null;
}});exports.default=


RegisterFormPage;