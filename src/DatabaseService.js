const pg = require("pg");

const url = require("url");
const denodeify = require("denodeify");
import Configuration from "./Configuration";

const params = url.parse(Configuration.DATABASE_URL);
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
    await pool.connect();
    console.log("Postgres pool connected!");
    result = await pool.query("SELECT COUNT (*) FROM documents", []);
    console.log("Postgres table present!", result);
  } catch (e) {
    if (e.toString() === 'error: relation "documents" does not exist') {
      console.log("Creating table..");
      await pool.query(createTableQuery);
      console.log("Created table!");
    }
  }
}

async function createDoc(docName, value) {
  await pool.query("INSERT INTO documents (name, value) VALUES ($1, $2)", [
    docName,
    value
  ]);
}

async function writeDoc(docName, value) {
  await pool.query(
    "INSERT INTO documents (name, value) VALUES ($1, $2) ON CONFLICT (name) DO UPDATE SET value = $2;",
    [docName, value]
  );
}

async function getDoc(docName) {
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
