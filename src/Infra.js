const { promisifyAll } = require("bluebird");
const Sequelize = require("sequelize");
const { createModel } = require("./DB");
const { Client } = require("pg");

const Email = require("./Infra-Email");

module.exports = async options => {
  const appListenPort = options.port || process.env.PORT || 3000;
  const host = options.host
    ? options.host
    : process.env.PRIMARY_HOST || `localhost:${appListenPort}`;
  const hostSSL = process.env.NODE_ENV === "production";
  const hostURI = `http${hostSSL ? "s" : ""}://${host}`;

  const rootUser = process.env.ROOT_USER || "root";

  const env =
    options.env || (process.env.JEST_TEST ? "testing" : process.env.NODE_ENV);

  let pg = null;
  let sequelize = null;
  if (options.localStorage) {
    // Used for "local" runtime
    sequelize = new Sequelize({
      dialect: "sqlite",
      storage: options.localStorage,

      logging: false,
      operatorsAliases: false,
    });
  } else if (process.env.DATABASE_URL) {
    // Used in prod
    pg = new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.PG_NO_SSL ? false : true,
    });
    await pg.connect();
    sequelize = new Sequelize(process.env.DATABASE_URL, {
      logging: false,
      operatorsAliases: false,
    });
  } else {
    // Used for core Aven development (`yarn dev`)
    sequelize = new Sequelize({
      dialect: "sqlite",
      storage: ".AvenDB.sqlite",

      logging: false,
      operatorsAliases: false,
    });
  }
  if (!sequelize) {
    throw "Could not initialize the database!";
  }
  const email = await Email();

  const close = async () => {
    if (pg) await pg.end();
    await sequelize.close();
  };

  async function getPublicDebugInfo() {
    const results = {
      mode: process.env.NODE_ENV,
      host,
      useSSL: hostSSL,
    };
    if (pg) {
      try {
        await pg.query("SELECT $1::text as message", ["Hello world!"]);
        results.pg = true;
      } catch (e) {
        results.pg = false;
      }
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
    rootUser,
    pg,
    sequelize,
    email,
    close,
    getPublicDebugInfo,
    model,
    appListenPort,
  };

  return infra;
};
