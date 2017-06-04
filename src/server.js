require("babel-core/register");
require("babel-polyfill");

const bodyParser = require("body-parser");
const express = require("express");
const app = express();

import config from "./config";
import dispatch from "./dispatch";
import pageRequests from "./pageRequests";

app.post("/api/v1/dispatch", bodyParser.json(), async (req, res) => {
  const result = await dispatch(req.body);
});
app.use("/assets", express.static(__dirname + "/static"));
app.get("/", function(req, res) {
  res.send(
    "Actual homepage coming soon. For now, post an action to /api/v1/dispatch"
  );
});

pageRequests(app);

app.get("/debug", function(req, res) {
  res.send(JSON.stringify(config.publicInfo));
});

app.listen(config.port, function() {
  console.log("Node app is running on port", config.port);
});
