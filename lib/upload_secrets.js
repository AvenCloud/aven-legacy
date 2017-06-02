var fs=require("fs");
var child_process=require("child_process");
var secrets;

secrets=fs.readFileSync("secrets.json",{encoding:"utf8"});
secrets=new Buffer(secrets);
secrets=secrets.toString("base64");

child_process.execFileSync(
"heroku",
["config:set","AVEN_SECRETS="+secrets,"--app","aven-prod"],
{stdio:"inherit"});