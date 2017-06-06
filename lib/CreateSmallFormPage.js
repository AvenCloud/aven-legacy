Object.defineProperty(exports,"__esModule",{value:true});var _extends=Object.assign||function(target){for(var i=1;i<arguments.length;i++){var source=arguments[i];for(var key in source){if(Object.prototype.hasOwnProperty.call(source,key)){target[key]=source[key];}}}return target;};var _jsxFileName="src/CreateSmallFormPage.js";var _createClass=function(){function defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||false;descriptor.configurable=true;if("value"in descriptor)descriptor.writable=true;Object.defineProperty(target,descriptor.key,descriptor);}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor;};}();exports.default=


















































































CreateSmallFormPage;var _react=require("react");var _react2=_interopRequireDefault(_react);function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}function _possibleConstructorReturn(self,call){if(!self){throw new ReferenceError("this hasn't been initialised - super() hasn't been called");}return call&&(typeof call==="object"||typeof call==="function")?call:self;}function _inherits(subClass,superClass){if(typeof superClass!=="function"&&superClass!==null){throw new TypeError("Super expression must either be null or a function, not "+typeof superClass);}subClass.prototype=Object.create(superClass&&superClass.prototype,{constructor:{value:subClass,enumerable:false,writable:true,configurable:true}});if(superClass)Object.setPrototypeOf?Object.setPrototypeOf(subClass,superClass):subClass.__proto__=superClass;}var EmailPhoneThing=function(_React$Component){_inherits(EmailPhoneThing,_React$Component);function EmailPhoneThing(){_classCallCheck(this,EmailPhoneThing);return _possibleConstructorReturn(this,(EmailPhoneThing.__proto__||Object.getPrototypeOf(EmailPhoneThing)).apply(this,arguments));}_createClass(EmailPhoneThing,[{key:"render",value:function render(){return _react2.default.createElement("div",{__source:{fileName:_jsxFileName,lineNumber:6}},_react2.default.createElement("div",{className:"form-group",key:this.props.name,__source:{fileName:_jsxFileName,lineNumber:7}},_react2.default.createElement("label",{className:"control-label","for":this.props.name,__source:{fileName:_jsxFileName,lineNumber:8}},this.props.label),_react2.default.createElement("input",{className:"form-control",id:this.props.name,placeholder:this.props.placeholder,name:this.props.name,type:"text",__source:{fileName:_jsxFileName,lineNumber:11}})));}}]);return EmailPhoneThing;}(_react2.default.Component);var SmallFormPage=function SmallFormPage(_ref){var children=_ref.children;return _react2.default.createElement("div",{style:{},__source:{fileName:_jsxFileName,lineNumber:25}},_react2.default.createElement("div",{style:{backgroundImage:"url('/assets/aven-forest.jpg')",filter:"blur(15px)",backgroundSize:"cover",position:"fixed",left:-15,right:-15,bottom:-15,top:-15,zIndex:0},__source:{fileName:_jsxFileName,lineNumber:26}}),_react2.default.createElement("div",{style:{position:"fixed",left:0,right:0,bottom:0,top:0,backgroundColor:"rgba(255,255,255,0.7)",zIndex:1},__source:{fileName:_jsxFileName,lineNumber:39}}),_react2.default.createElement("div",{style:{position:"absolute",left:0,right:0,bottom:0,top:0,zIndex:2},__source:{fileName:_jsxFileName,lineNumber:51}},_react2.default.createElement("div",{style:{width:300,margin:"60px auto",alignItems:"stretch",display:"flex",flexDirection:"column"},__source:{fileName:_jsxFileName,lineNumber:61}},_react2.default.createElement("a",{href:"/",style:{textAlign:"center"},__source:{fileName:_jsxFileName,lineNumber:70}},_react2.default.createElement("img",{src:"/assets/aven.svg",style:{width:128,marginBottom:60},__source:{fileName:_jsxFileName,lineNumber:71}})),_react2.default.createElement("div",{className:"well",style:{},__source:{fileName:_jsxFileName,lineNumber:76}},children))));};function CreateSmallFormPage(opts){var
FormPage=function(_React$Component2){_inherits(FormPage,_React$Component2);function FormPage(){_classCallCheck(this,FormPage);return _possibleConstructorReturn(this,(FormPage.__proto__||Object.getPrototypeOf(FormPage)).apply(this,arguments));}_createClass(FormPage,[{key:"render",value:function render()




{var _props=
this.props,validationError=_props.validationError,values=_props.values;
return(
_react2.default.createElement(SmallFormPage,{__source:{fileName:_jsxFileName,lineNumber:93}},
_react2.default.createElement("form",{method:"post",__source:{fileName:_jsxFileName,lineNumber:94}},
_react2.default.createElement("h1",{style:{position:"relative",bottom:15},__source:{fileName:_jsxFileName,lineNumber:95}},
opts.heading),

opts.subheadingText&&
_react2.default.createElement("p",{style:{marginTop:-10,marginBottom:30},__source:{fileName:_jsxFileName,lineNumber:99}},
opts.subheadingText),

opts.inputs.map(function(inputConfig,inputIndex){
if(inputConfig.type==="email-phone-signup"){
return(
_react2.default.createElement(EmailPhoneThing,_extends({key:"email-phone-signup"},inputConfig,{__source:{fileName:_jsxFileName,lineNumber:105}})));

}
return(
_react2.default.createElement("div",{className:"form-group",key:inputConfig.name,__source:{fileName:_jsxFileName,lineNumber:109}},
inputConfig.rightLabel&&
_react2.default.createElement("span",{className:"control-label-right",__source:{fileName:_jsxFileName,lineNumber:111}},
inputConfig.rightLabel(values)),

inputConfig.label&&
_react2.default.createElement("label",{className:"control-label","for":inputConfig.name,__source:{fileName:_jsxFileName,lineNumber:115}},
inputConfig.label),

_react2.default.createElement("input",{
className:"form-control",
id:inputConfig.name,
name:inputConfig.name,
placeholder:inputConfig.placeholder,
type:inputConfig.type,__source:{fileName:_jsxFileName,lineNumber:118}})));



}),

validationError&&
_react2.default.createElement("div",{className:"alert alert-dismissible alert-danger",__source:{fileName:_jsxFileName,lineNumber:130}},
_react2.default.createElement("button",{type:"button",className:"close","data-dismiss":"alert",__source:{fileName:_jsxFileName,lineNumber:131}},"\xD7"),


_react2.default.createElement("strong",{__source:{fileName:_jsxFileName,lineNumber:134}},"Whoops!")," ",validationError),


_react2.default.createElement("div",{
className:"form-group",
style:{position:"relative",top:10},__source:{fileName:_jsxFileName,lineNumber:137}},

_react2.default.createElement("div",{
className:"input-group",
style:{
display:"flex",
alignItems:"center",
flexDirection:"column"},__source:{fileName:_jsxFileName,lineNumber:141}},


_react2.default.createElement("button",{className:"btn btn-primary btn-lg",__source:{fileName:_jsxFileName,lineNumber:149}},
opts.submitButtonLabel))))));








}}]);return FormPage;}(_react2.default.Component);FormPage.successNavigationAction=opts.successNavigationAction;FormPage.getActionForInput=opts.getActionForInput;FormPage.getTitle=function(){return opts.title;};FormPage.validate=opts.validate;

return FormPage;
}