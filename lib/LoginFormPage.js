Object.defineProperty(exports,"__esModule",{value:true});var _jsxFileName="src/LoginFormPage.js";var _CreateSmallFormPage=require("./CreateSmallFormPage");var _CreateSmallFormPage2=_interopRequireDefault(_CreateSmallFormPage);
var _react=require("react");var _react2=_interopRequireDefault(_react);function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}

var LoginFormPage=(0,_CreateSmallFormPage2.default)({
submitButtonLabel:"Sign in",
title:"Login",
heading:"Login to Aven",
successNavigationAction:{uri:"/"},
inputs:[
{
type:"text",
name:"username",
label:"Username, Email, or Phone #"},

{
type:"password",
name:"password",
label:["Password"],
rightLabel:function rightLabel(){return["Forgot? ",_react2.default.createElement("a",{href:"#",__source:{fileName:_jsxFileName,lineNumber:19}},"Click here to reset")];}}],


validate:function validate(state){
if(!state.password||!state.username){
return"Must provide both the username and the password";
}
if(state.password.length<6){
return"Please choose a longer _password_";
}
return null;
}});exports.default=


LoginFormPage;