var express = require("express");
var app = express();

var fs = require("fs");
var secrets;

try {
  secrets = fs.readFileSync("secrets.json", { encoding: "utf8" });
  secrets = JSON.parse(secrets);
} catch (e) {
  secrets = new Buffer(process.env.AVEN_SECRETS, "base64");
  secrets = JSON.parse(secrets.toString());
}

console.log(secrets);

const CONFIG = {
  env: process.env.NODE_ENV,
  port: process.env.PORT || 5000,
  secrets: secrets
};

app.get("/", function(req, res) {
  res.send("Coming Soon!");
});

app.get("/debug", function(req, res) {
  res.send(
    JSON.stringify({
      env: CONFIG.env,
      port: CONFIG.port,
      secrets: Object.keys(CONFIG.secrets)
    })
  );
});

app.listen(CONFIG.port, function() {
  console.log("Node app is running on port", CONFIG.port);
});
