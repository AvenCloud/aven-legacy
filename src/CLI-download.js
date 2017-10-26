const homedir = require("os").homedir();
const join = require("path").join;
const fs = require("fs");
const commander = require("commander");
const babel = require("babel-core");
const presetEs2015 = require("babel-preset-es2015");
const presetStage0 = require("babel-preset-stage-0");
const presetReact = require("babel-preset-react");
const prompt = require("prompt");
const denodeify = require("denodeify");
const { dispatch } = require("./CLI-utilities");

const fsExists = denodeify(fs.exists);
const fsMkdir = denodeify(fs.mkdir);
const fsReaddir = denodeify(fs.readdir);
const fsLstat = denodeify(fs.lstat);
const fsReadFile = denodeify(fs.readFile);

require("babel-core/register");
require("babel-polyfill");

const download = async () => console.log('woah');

commander
	.version("0.1.0")
	.parse(process.argv);

download(commander.server)
	.then(() => {
		console.log("Download completed!");
	})
	.catch(e => {
		console.log("Download failure!");
		console.error(e);
	});
