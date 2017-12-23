const request = require("supertest")
const { initTestApp } = require("./TestUtilities")

let app = null

beforeEach(async () => {
  app = await initTestApp()
})

afterEach(async () => {
  await app.closeTest()
})

test("Postgres and Redis are online according to service", async () => {
  const result = await request(app)
    .get("/api/debug")
    .set("Accept", "application/json")
    .expect(200)
  expect(result.body.pg).toBe(true)
  expect(result.body.redis).toBe(true)
})

test("Dispatched action with invalid type results in 400 error", async () => {
  const result = await app.testDispatchError({ type: "BadAction" })
  expect(result.code).toBe("UNKNOWN_ACTION")
})
