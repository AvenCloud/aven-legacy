const fs = require("fs");

let secrets;
try {
  secrets = fs.readFileSync("secrets.json", { encoding: "utf8" });
  secrets = JSON.parse(secrets);
} catch (e) {
  secrets = new Buffer(process.env.AVEN_SECRETS, "base64");
  secrets = JSON.parse(secrets.toString());
}

const postgresURL = process.env.DATABASE_URL || secrets.postgres_uri;

const env = process.env.NODE_ENV;

const isSecure = env !== "development";

const port = process.env.PORT || 5000;

const publicInfo = { env, isSecure };

const config = {
  publicInfo,
  env,
  port,
  secrets,
  isSecure,
  postgresURL
};

export default config;
