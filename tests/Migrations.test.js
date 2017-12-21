jest.disableAutomock();

const { Client } = require("pg");

let db = null;

beforeAll(async () => {
  const pgConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.PG_NO_SSL ? false : true
  };
  pg = new Client(pgConfig);
  await pg.connect();
});

afterAll(async () => {
  await pg.close();
});

test("Initial migration has run", async () => {
  const response = await pg.query(`
        SELECT column_name
            FROM information_schema.columns
            WHERE table_name='Users' and column_name='displayName';
    `);

  await pg.end();
  expect(response.rows.length).toBe(1);
});
