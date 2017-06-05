Object.defineProperty(exports,"__esModule",{value:true});var _react=require("react");var _react2=_interopRequireDefault(_react);

var _ReactComponentHandleForm=require("./ReactComponentHandleForm");var _ReactComponentHandleForm2=_interopRequireDefault(_ReactComponentHandleForm);
var _LoginFormPage=require("./LoginFormPage");var _LoginFormPage2=_interopRequireDefault(_LoginFormPage);
var _RegisterFormPage=require("./RegisterFormPage");var _RegisterFormPage2=_interopRequireDefault(_RegisterFormPage);
var _ComingSoonPage=require("./ComingSoonPage");var _ComingSoonPage2=_interopRequireDefault(_ComingSoonPage);
var _VerifyFormPage=require("./VerifyFormPage");var _VerifyFormPage2=_interopRequireDefault(_VerifyFormPage);
var _HomePage=require("./HomePage");var _HomePage2=_interopRequireDefault(_HomePage);function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}

var NavigationActions={
NavigateHomeAction:{
path:"/",
component:_HomePage2.default},

NavigateLoginAction:{
path:"/auth/login",
handler:_ReactComponentHandleForm2.default,
component:_LoginFormPage2.default},

NavigateRegisterAction:{
path:"/auth/register",
handler:_ReactComponentHandleForm2.default,
component:_RegisterFormPage2.default},

NavigateVerifyAction:{
path:"/auth/verify",
handler:_ReactComponentHandleForm2.default,
component:_VerifyFormPage2.default},


NotFoundAction:{
component:_ComingSoonPage2.default}};exports.default=



NavigationActions;