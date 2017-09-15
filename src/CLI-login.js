const fetch = require("node-fetch");
const homedir = require("os").homedir();
const join = require("path").join;
const fs = require("fs");
const commander = require("commander");
const prompt = require("prompt");

function login(configFile, server, username, password) {
	let configData = {};
	try {
		configData = Object.assign({}, JSON.parse(fs.readFileSync(configFile)));
	} catch (e) {}
	fetch(server + "/api/dispatch", {
		method: "POST",
		body: JSON.stringify({
			type: "AuthLoginAction",
			username,
			password
		}),
		headers: { "Content-Type": "application/json" }
	})
		.then(resp => resp.json())
		.then(actionResult => {
			if (!actionResult || !actionResult.session) {
				console.error("Login failed!");
				process.exit(1);
			}
			configData.username = actionResult.username;
			configData.session = actionResult.session;
			configData.server = server;
			fs.writeFileSync(configFile, JSON.stringify(configData));
			console.log("Login successful!");
		})
		.catch(err => {
			console.error("Login failed!");
			process.exit(1);
		});
}

const defaultConfigFile = join(homedir, ".avenconfig");

commander
	.version("0.1.0")
	.command("login [username]", "Log in to the Aven backend")
	.option(
		"--server [protocol_and_host]",
		"Specify the aven server to point to",
		a => a,
		"https://aven.io"
	)
	.option(
		"--configFile [path]",
		"Alternate location of the aven config file, instead of ~/.avenconfig",
		a => a,
		defaultConfigFile
	)
	.action(function(username) {
		prompt.get(
			{
				properties: {
					password: {
						description: "Enter your password",
						type: "string",
						required: true,
						hidden: true
					}
				}
			},
			(err, result) => {
				if (err) {
					console.error("Invalid password input!");
					process.exit(1);
				}
				login(
					commander.configFile,
					commander.server,
					username,
					result.password
				);
			}
		);
	});

commander.parse(process.argv);
