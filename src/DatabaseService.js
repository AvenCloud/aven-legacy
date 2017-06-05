const pg = require("pg");

const url = require("url");
const denodeify = require("denodeify");
import Configuration from "./Configuration";

const params = url.parse(Configuration.postgresURL);
const auth = params.auth.split(":");

const config = {
  user: auth[0],
  password: auth[1],
  host: params.hostname,
  port: params.port,
  database: params.pathname.split("/")[1],
  ssl: true
};
const pool = new pg.Pool(config);
const query = denodeify(pool.query);
const connect = denodeify(pool.connect);

async function createDoc(docName, value) {
  await pool.connect();
  await pool.query("INSERT INTO documents (name, value) VALUES ($1, $2)", [
    docName,
    value
  ]);
}

async function writeDoc(docName, value) {
  await pool.connect();
  await pool.query(
    "INSERT INTO documents (name, value) VALUES ($1, $2) ON CONFLICT (name) DO UPDATE SET value = $2;",
    [docName, value]
  );
}

const DatabaseService = {
  writeDoc,
  createDoc
};

export default DatabaseService;
