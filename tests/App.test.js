jest.disableAutomock();

const App = require("../src/App");
const request = require("supertest");
const Infra = require('../src/Infra');

let app = null;

beforeEach(async () => {
  const infra = await Infra({ port: 6998, env: 'testing' });
  app = await App(infra);
});

afterEach(async () => {
	await app.close();
});

test("Postgres and Redis are online according to service", async () => {
	const result = await request(app)
		.get("/api/debug")
		.set("Accept", "application/json")
		.expect(200);
	expect(result.body.pg).toBe(true);
	expect(result.body.redis).toBe(true);
});

test("Dispatched action with invalid type results in 400 error", async () => {
	const result = await request(app)
		.post("/api/dispatch")
		.send({ action: "BadActionType" })
		.set("Accept", "application/json")
		.expect(400);
});
