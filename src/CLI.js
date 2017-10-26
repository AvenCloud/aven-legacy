#!/usr/bin/env node

const fetch = require("node-fetch");

const homedir = require("os").homedir();

const join = require("path").join;

const fs = require("fs");

const input = require("commander");

input
	.version("0.1.0")
	.command("init [project]", "Create or download a new project")
	.command("upload", "Uploads the current Aven project folder, replacing remote changes")
	.command("download", "Downloads the current Aven project folder, replacing local changes")
	.command("init [user_and_project]", "Create or download a new project")
	.command("login [user]", "Login to the Aven server")
	// .option("--server", "Specify the aven server to point to")
	// .option('--avenconfig', 'Specify the configuration file for login persistence. Defaults to ~/.avenconfig')
	.parse(process.argv);

// const defaultConfigFile =
// const configFile = input.avenconfig || defaultConfigFile;
// const config = fs.readFileSync(configFile);
// input.server
