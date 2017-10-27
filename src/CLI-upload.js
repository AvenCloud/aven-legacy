const homedir = require("os").homedir();
const join = require("path").join;
const commander = require("commander");

const {
	dispatch,
	fsExists,
	fsMkdir,
	fsReaddir,
	fsLstat,
	fsReadFile,
	downloadFile,
	upload
} = require("./CLI-utilities");

require("babel-core/register");
require("babel-polyfill");

async function go() {
	const auth = {
		...JSON.parse(await fsReadFile(join(process.cwd(), ".avenconfig")))
	};
	await upload(auth, process.cwd());
}

commander.version("0.1.0").parse(process.argv);

go()
	.then(() => {
		console.log("Upload completed!");
	})
	.catch(e => {
		console.log("Upload failure!");
		console.error(e);
	});
