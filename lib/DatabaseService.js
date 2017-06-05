Object.defineProperty(exports,"__esModule",{value:true});



var _Configuration=require("./Configuration");var _Configuration2=_interopRequireDefault(_Configuration);function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}var pg=require("pg");var url=require("url");var denodeify=require("denodeify");

var params=url.parse(_Configuration2.default.postgresURL);
var auth=params.auth.split(":");

var config={
user:auth[0],
password:auth[1],
host:params.hostname,
port:params.port,
database:params.pathname.split("/")[1],
ssl:true};

var pool=new pg.Pool(config);
var query=denodeify(pool.query);
var connect=denodeify(pool.connect);

function createDoc(docName,value){return regeneratorRuntime.async(function createDoc$(_context){while(1){switch(_context.prev=_context.next){case 0:_context.next=2;return regeneratorRuntime.awrap(
pool.connect());case 2:_context.next=4;return regeneratorRuntime.awrap(
pool.query("INSERT INTO documents (name, value) VALUES ($1, $2)",[
docName,
value]));case 4:case"end":return _context.stop();}}},null,this);}



function writeDoc(docName,value){return regeneratorRuntime.async(function writeDoc$(_context2){while(1){switch(_context2.prev=_context2.next){case 0:_context2.next=2;return regeneratorRuntime.awrap(
pool.connect());case 2:_context2.next=4;return regeneratorRuntime.awrap(
pool.query(
"INSERT INTO documents (name, value) VALUES ($1, $2) ON CONFLICT (name) DO UPDATE SET value = $2;",
[docName,value]));case 4:case"end":return _context2.stop();}}},null,this);}



var DatabaseService={
writeDoc:writeDoc,
createDoc:createDoc};exports.default=


DatabaseService;