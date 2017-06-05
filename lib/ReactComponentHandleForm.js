Object.defineProperty(exports,"__esModule",{value:true});var _jsxFileName="src/ReactComponentHandleForm.js";exports.default=





ReactComponentHandleForm;var _react=require("react");var _react2=_interopRequireDefault(_react);var _server=require("react-dom/server");var _AppPage=require("./AppPage");var _AppPage2=_interopRequireDefault(_AppPage);var _DispatchAction=require("./DispatchAction");var _DispatchAction2=_interopRequireDefault(_DispatchAction);function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}var handleBodyParser=require("body-parser").urlencoded({extended:false});function ReactComponentHandleForm(Component){
return function(req,res){
if(req.method==="GET"){
var title=_AppPage2.default.getTitle(Component.getTitle());
res.send((0,_server.renderToString)(_react2.default.createElement(_AppPage2.default,{title:title,__source:{fileName:_jsxFileName,lineNumber:11}},_react2.default.createElement(Component,{__source:{fileName:_jsxFileName,lineNumber:11}}))));
return;
}
if(req.method==="POST"){
handleBodyParser(req,res,function(){
var input=req.body;
var validationError=Component.validate(input);
if(validationError){
var _title=_AppPage2.default.getTitle(Component.getTitle());
res.send(
(0,_server.renderToString)(
_react2.default.createElement(_AppPage2.default,{title:_title,__source:{fileName:_jsxFileName,lineNumber:22}},
_react2.default.createElement(Component,{validationError:validationError,__source:{fileName:_jsxFileName,lineNumber:23}}))));



return;
}
var action=Component.getActionForInput(input);
if(action){
var actionResult=(0,_DispatchAction2.default)(action).
then(function(result){return{state:"passed",result:result};}).
catch(function(result){return{state:"rejected",result:result};}).
then(function(data){
console.log("Dispatch result from form post:");
console.log(JSON.stringify(data,null,2));
if(
data.state==="passed"&&
Component.successNavigationAction&&
Component.successNavigationAction.uri)
{
return res.redirect(Component.successNavigationAction.uri);
}
res.send(
(0,_server.renderToString)(
_react2.default.createElement(_AppPage2.default,{title:_AppPage2.default.getTitle(Component.getTitle()),__source:{fileName:_jsxFileName,lineNumber:46}},
_react2.default.createElement(Component,{
validationError:
"Success! But we don't know how to handle it",__source:{fileName:_jsxFileName,lineNumber:47}}))));





});
}
});
return;
}
res.status(405).send();
};
}