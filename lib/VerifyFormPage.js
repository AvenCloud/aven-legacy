Object.defineProperty(exports,"__esModule",{value:true});var _extends=Object.assign||function(target){for(var i=1;i<arguments.length;i++){var source=arguments[i];for(var key in source){if(Object.prototype.hasOwnProperty.call(source,key)){target[key]=source[key];}}}return target;};var _CreateSmallFormPage=require("./CreateSmallFormPage");var _CreateSmallFormPage2=_interopRequireDefault(_CreateSmallFormPage);
var _react=require("react");var _react2=_interopRequireDefault(_react);function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}

var LoginFormPage=(0,_CreateSmallFormPage2.default)({
submitButtonLabel:"Verify",
title:"Verify",
heading:"Verification",
successNavigationAction:{type:"NavigateHomeAction"},
inputs:[
{
type:"text",
name:"username",
label:"Username"},

{
type:"text",
name:"code",
label:["Code that we sent you"]}],


getActionForInput:function getActionForInput(state){return _extends({type:"AuthVerifyAction"},state);},
validate:function validate(state){
if(!state.username||!state.code){
return"Must provide both the username and the validation code";
}
return null;
}});exports.default=


LoginFormPage;