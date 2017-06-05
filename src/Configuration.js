var fs = require("fs");
var secrets;

try {
  secrets = fs.readFileSync("secrets.json", { encoding: "utf8" });
  secrets = JSON.parse(secrets);
} catch (e) {
  secrets = new Buffer(process.env.AVEN_SECRETS, "base64");
  secrets = JSON.parse(secrets.toString());
}

var postgresURL = process.env.DATABASE_URL || secrets.postgres_uri;

const config = {
  env: process.env.NODE_ENV,
  port: process.env.PORT || 5000,
  secrets,
  postgresURL
};

export default config;
