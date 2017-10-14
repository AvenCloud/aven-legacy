const fs = require("fs");

let secretsFile = null;
try {
  secretsFile = fs.readFileSync("secrets.json", { encoding: "utf8" });
  secretsFile = JSON.parse(secretsFile);
} catch (e) {}

let secrets = secretsFile;
if (process.env.NODE_ENV === "test") {
  secrets = {};
} else if (process.env.AVEN_SECRETS) {
  secrets = new Buffer(process.env.AVEN_SECRETS, "base64");
  secrets = JSON.parse(secrets.toString());
} else {
  throw "Cannot read secrets to start app";
}

const postgresURL = process.env.DATABASE_URL || secrets.postgres_uri;
const redisURL = process.env.REDIS_URL || secrets.redis_url;
const { POSTGRES_DANGER_DISABLE_SSL } = process.env;
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
  postgresURL,
  redisURL,
  POSTGRES_DANGER_DISABLE_SSL
};

export default config;
