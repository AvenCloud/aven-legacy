const pg = require("pg");

const url = require("url");
const denodeify = require("denodeify");
import Configuration from "./Configuration";

const params = url.parse(Configuration.postgresURL);
const auth = params.auth.split(":");

const shouldUseSSL = Configuration.POSTGRES_DANGER_DISABLE_SSL ? false : true;

const config = {
  user: auth[0],
  password: auth[1],
  host: params.hostname,
  port: params.port,
  database: params.pathname.split("/")[1],
  ssl: shouldUseSSL
};
const pool = new pg.Pool(config);
const query = denodeify(pool.query);
const connect = denodeify(pool.connect);

const createTableQuery = `
CREATE TABLE documents (
name varchar(140) NOT NULL,
value text NOT NULL,
CONSTRAINT primarykey PRIMARY KEY (name)
);
`;

async function wakeup() {
  let result = null;
  try {
    result = await pool.query("SELECT COUNT (*) FROM documents", []);
  } catch (e) {
    if (e.toString() === 'error: relation "documents" does not exist') {
      await pool.query(createTableQuery);
    }
  }
}

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

async function getDoc(docName) {
  await pool.connect();
  const res = await pool.query("SELECT value FROM documents WHERE name = $1;", [
    docName
  ]);
  if (res.rows && res.rows[0]) {
    const val = res.rows[0].value;
    try {
      return JSON.parse(val);
    } catch (e) {
      return val;
    }
  }
  return null;
}

const DatabaseService = {
  getDoc,
  writeDoc,
  createDoc,
  wakeup
};

export default DatabaseService;
