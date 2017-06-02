var express = require("express");
var fetch = require("node-fetch");
var pg = require("pg");
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

var DATABASE_URL = process.env.DATABASE_URL || secrets.postgres_uri;
pg.defaults.ssl = true;

const CONFIG = {
  env: process.env.NODE_ENV,
  port: process.env.PORT || 5000,
  secrets: secrets
};

app.get("/", function(req, res) {
  res.send("Greatness Coming Eventually!");
});

app.get("/users", function(req, res) {
  pg.connect(DATABASE_URL, function(err, client) {
    if (err) throw err;
    client.query("SELECT * FROM users;").on("end", function(respond) {
      res.status(200);
      res.send(respond.rows);
    });
  });
});

app.get("/sms/:number", function(req, res) {
  res.send(req.params.number);
  const ab = new Buffer(
    CONFIG.secrets.plivo_id + ":" + CONFIG.secrets.plivo_key
  ).toString("base64");

  const endpointData = {
    src: "16503311790",
    dst: req.params.number,
    text: "hello world"
  };
  fetch(
    "https://api.plivo.com/v1/Account/" + CONFIG.secrets.plivo_id + "/Message/",
    {
      method: "post",
      headers: {
        Authorization: "Basic " + ab,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(endpointData)
    }
  )
    .then(function(res) {
      return res.json();
    })
    .then(function(body) {
      console.log(body);
    });
});

app.get("/email", function(req, res) {
  res.send(req.params.number);
  const ab = new Buffer(
    CONFIG.secrets.plivo_id + ":" + CONFIG.secrets.plivo_key
  ).toString("base64");

  const endpointData = {
    personalizations: [{ to: [{ email: "ericvicenti@gmail.com" }] }],
    from: { email: "test@example.com" },
    subject: "Sending with SendGrid is Fun",
    content: [{ type: "text/plain", value: "It even works from my code" }]
  };
  fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "post",
    headers: {
      Authorization: "Bearer " + CONFIG.secrets.sendgrid_key,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(endpointData)
  })
    .then(function(res) {
      return res.json();
    })
    .then(function(body) {
      console.log(body);
    });
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
