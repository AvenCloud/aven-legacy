const fetch = require("node-fetch");

const dispatch = async (action, auth) => {
	const result = await fetch(auth.server + "/api/dispatch", {
		method: "POST",
		body: JSON.stringify(action),
		headers: { "Content-Type": "application/json" }
	});
	const resultJSON = await result.json();
};

module.exports = {
	dispatch
};
