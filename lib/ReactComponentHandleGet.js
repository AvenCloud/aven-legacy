Object.defineProperty(exports,"__esModule",{value:true});var _jsxFileName="src/ReactComponentHandleGet.js";exports.default=



ReactComponentHandleGet;var _react=require("react");var _react2=_interopRequireDefault(_react);var _server=require("react-dom/server");var _AppPage=require("./AppPage");var _AppPage2=_interopRequireDefault(_AppPage);function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}function ReactComponentHandleGet(Component){
return function(req,res){
if(req.method==="GET"){
var title=_AppPage2.default.getTitle(Component.getTitle());
res.send((0,_server.renderToString)(_react2.default.createElement(_AppPage2.default,{title:title,__source:{fileName:_jsxFileName,lineNumber:9}},_react2.default.createElement(Component,{__source:{fileName:_jsxFileName,lineNumber:9}}))));
return;
}
res.status(405).send();
};
}