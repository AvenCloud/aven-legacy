Object.defineProperty(exports,"__esModule",{value:true});var _jsxFileName="src/AppPage.js";var _createClass=function(){function defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||false;descriptor.configurable=true;if("value"in descriptor)descriptor.writable=true;Object.defineProperty(target,descriptor.key,descriptor);}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor;};}();var _react=require("react");var _react2=_interopRequireDefault(_react);function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}function _possibleConstructorReturn(self,call){if(!self){throw new ReferenceError("this hasn't been initialised - super() hasn't been called");}return call&&(typeof call==="object"||typeof call==="function")?call:self;}function _inherits(subClass,superClass){if(typeof superClass!=="function"&&superClass!==null){throw new TypeError("Super expression must either be null or a function, not "+typeof superClass);}subClass.prototype=Object.create(superClass&&superClass.prototype,{constructor:{value:subClass,enumerable:false,writable:true,configurable:true}});if(superClass)Object.setPrototypeOf?Object.setPrototypeOf(subClass,superClass):subClass.__proto__=superClass;}var

AppPage=function(_React$Component){_inherits(AppPage,_React$Component);function AppPage(){_classCallCheck(this,AppPage);return _possibleConstructorReturn(this,(AppPage.__proto__||Object.getPrototypeOf(AppPage)).apply(this,arguments));}_createClass(AppPage,[{key:"render",value:function render()


{var _props=
this.props,title=_props.title,children=_props.children;
return(
_react2.default.createElement("html",{__source:{fileName:_jsxFileName,lineNumber:9}},
_react2.default.createElement("head",{__source:{fileName:_jsxFileName,lineNumber:10}},
_react2.default.createElement("link",{rel:"stylesheet",href:"/assets/bootstrap.css",__source:{fileName:_jsxFileName,lineNumber:11}}),
_react2.default.createElement("link",{rel:"stylesheet",href:"/assets/Aven.css",__source:{fileName:_jsxFileName,lineNumber:12}}),
_react2.default.createElement("title",{__source:{fileName:_jsxFileName,lineNumber:13}},title)),

_react2.default.createElement("body",{__source:{fileName:_jsxFileName,lineNumber:15}},children)));


}}]);return AppPage;}(_react2.default.Component);AppPage.getTitle=function(childTitle){return childTitle?childTitle+" | Aven":"Aven";};exports.default=AppPage;