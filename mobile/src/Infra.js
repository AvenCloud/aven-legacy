const fqdn = require("fqdn");
const { promisifyAll } = require("bluebird");
const Sequelize = require("sequelize");
const { createModel } = require("./DB");
const { Client } = require("pg");
const Redis = require("redis");
promisifyAll(Redis.RedisClient.prototype);
promisifyAll(Redis.Multi.prototype);

const Email = require("./Infra-Email");

module.exports = async options => {
  const appListenPort = options.port || process.env.PORT || 3000;
  const host = options.host
    ? options.host
    : process.env.PRIMARY_HOST || `localhost:${appListenPort}`;
  const hostSSL = process.env.NODE_ENV === "production";
  const hostURI = `http${hostSSL ? "s" : ""}://${host}`;

  const env = options.env || process.env.NODE_ENV;

  const pg = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.PG_NO_SSL ? false : true,
  });
  await pg.connect();

  const redis = Redis.createClient(process.env.REDIS_URL);

  const sequelize = new Sequelize(process.env.DATABASE_URL, {
    logging: false,
    operatorsAliases: false,
  });

  const email = await Email();

  const close = async () => {
    await pg.end();
    await redis.quit();
    await sequelize.close();
  };

  async function getPublicDebugInfo() {
    const results = {
      asOf: new Date().toISOString(),
      fqdn: fqdn(),
      NODE_ENV: process.env.NODE_ENV,
      nodever: process.version,
      versions: process.versions,
      args: process.argv,
    };
    try {
      await pg.query("SELECT $1::text as message", ["Hello world!"]);
      results.pg = true;
    } catch (e) {
      results.pg = false;
    }
    try {
      await redis.set("test", "value");
      await redis.del("test");
      results.redis = true;
    } catch (e) {
      results.redis = false;
    }
    try {
      await sequelize.authenticate();
      results.sequelize = true;
    } catch (e) {
      results.sequelize = false;
    }
    return results;
  }

  const model = createModel(sequelize);

  const infra = {
    env,
    host,
    hostSSL,
    hostURI,
    pg,
    redis,
    sequelize,
    email,
    close,
    getPublicDebugInfo,
    model,
    appListenPort,
  };

  return infra;
};
