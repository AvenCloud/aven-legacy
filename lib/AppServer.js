var _this=this;







var _Configuration=require("./Configuration");var _Configuration2=_interopRequireDefault(_Configuration);
var _DispatchAction=require("./DispatchAction");var _DispatchAction2=_interopRequireDefault(_DispatchAction);
var _NavigationActions=require("./NavigationActions");var _NavigationActions2=_interopRequireDefault(_NavigationActions);
var _ReactComponentHandleGet=require("./ReactComponentHandleGet");var _ReactComponentHandleGet2=_interopRequireDefault(_ReactComponentHandleGet);
var _NotFoundPage=require("./NotFoundPage");var _NotFoundPage2=_interopRequireDefault(_NotFoundPage);function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}require("babel-core/register");require("babel-polyfill");var bodyParser=require("body-parser");var multer=require("multer")();var express=require("express");var app=express();

app.use(function(req,res,next){
var proto=req.headers["x-forwarded-proto"]||req.protocol;
console.log("ok",{
env:_Configuration2.default.env,
hostname:req.hostname,
proto:proto,
reqProto:req.protocol});

if(_Configuration2.default.env==="development"||req.hostname==="localhost"){
next();
return;
}
if(req.hostname==="aven.io"&&req.protocol==="https"){
next();
return;
}
if(req.hostname==="www.aven.io"){
res.redirect("https://aven.io"+req.path);
return;
}
if(proto!=="https"){


next();
return;
}

var matchesSubdomain=req.hostname.match("(.*).aven.io$");
if(matchesSubdomain){
res.send("Subdomains are not yet supported. Stay tuned!");
return;
}

res.redirect("https://aven.io"+req.path);
});

app.get("/debug",function(req,res){
res.send(JSON.stringify(_Configuration2.default.publicInfo));
});

app.post("/api/v1/dispatch",bodyParser.json(),function _callee(req,res){var result;return regeneratorRuntime.async(function _callee$(_context){while(1){switch(_context.prev=_context.next){case 0:_context.next=2;return regeneratorRuntime.awrap(
(0,_DispatchAction2.default)(req.body));case 2:result=_context.sent;case 3:case"end":return _context.stop();}}},null,_this);});


app.post("/_inbound_mail",multer.single(),function _callee2(req,res){var result;return regeneratorRuntime.async(function _callee2$(_context2){while(1){switch(_context2.prev=_context2.next){case 0:_context2.next=2;return regeneratorRuntime.awrap(
(0,_DispatchAction2.default)({
type:"EmailRecieveAction",
data:req.body}));case 2:result=_context2.sent;

res.send("hello kind email service");case 4:case"end":return _context2.stop();}}},null,_this);});


app.use("/assets",express.static(__dirname+"/static"));

var faviconHandler=express.static(__dirname+"/static/favicon.prod.ico");
if(_Configuration2.default.env==="development"){
faviconHandler=express.static(__dirname+"/static/favicon.dev.ico");
}

app.use("/favicon.ico",faviconHandler);

Object.keys(_NavigationActions2.default).forEach(function(actionName){var _NavigationActions$ac=
_NavigationActions2.default[actionName],path=_NavigationActions$ac.path,handler=_NavigationActions$ac.handler,component=_NavigationActions$ac.component;
var handlerToUse=handler||_ReactComponentHandleGet2.default;
var runIt=handlerToUse(component);
if(path){
app.all(path,runIt);
}
});

app.use((0,_ReactComponentHandleGet2.default)(_NotFoundPage2.default));

app.listen(_Configuration2.default.port,function(){
console.log("Node app is running on port",_Configuration2.default.port);
});