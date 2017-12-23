const { initTestApp } = require("./TestUtilities")

let app = null

beforeEach(async () => {
  app = await initTestApp()
})

afterEach(async () => {
  await app.closeTest()
})

test("Initial migration has run", async () => {
  const response = await app.infra.pg.query(`
        SELECT column_name
            FROM information_schema.columns
            WHERE table_name='Users' and column_name='displayName';
    `)

  expect(response.rows.length).toBe(1)
})
