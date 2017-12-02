const env = process.env.NODE_ENV;

const isSecure = env !== "development";

const publicInfo = { env, isSecure };

const port = process.env.PORT || 5000;

require("dotenv").config();

const config = {
  ...process.env,
  publicInfo,
  env,
  port
};

export default config;
