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

async function putFileObject(auth, path) {
	let fileData = await fsReadFile(path, { encoding: "utf8" }); // uh no bin support yet
	if (path.split(".js").length === 2 && path.split(".js")[1] === "") {
		const source = fileData;
		let dependencies = null;
		const parsedBabel = babel.transform(source, {
			sourceMaps: true,
			presets: [presetEs2015, presetStage0, presetReact],
			plugins: [
				({ parse, traverse }) => ({
					visitor: {
						ArrowFunctionExpression(path) {
							if (!dependencies) {
								const input = path.node.params[0];
								dependencies = input.properties.map(a => {
									return a.value.name;
								});
							}
						}
					}
				})
			]
		});
		fileData = JSON.stringify({
			dependencies,
			type: "JSModule",
			code: parsedBabel.code,
			map: parsedBabel.map,
			source
		});
	}
	const uploadResult = await dispatch(
		{
			type: "CreateDocAction",
			project: auth.projectName,
			user: auth.projectUser,
			data: fileData
		},
		auth
	);
	return uploadResult.docId;
}

async function putPathObject(auth, path) {
	const stat = await fsLstat(path);
	if (stat.isDirectory()) {
		return putFolderObject(auth, path);
	} else {
		return putFileObject(auth, path);
	}
}

async function putFolderObject(auth, path) {
	const items = await fsReaddir(path);
	const uploadableItems = items.filter(item => item !== ".avenconfig");
	const allIDs = await Promise.all(
		uploadableItems.map(item => putPathObject(auth, join(path, item)))
	);
	const files = {};
	uploadableItems.forEach((itemName, index) => {
		files[itemName] = {
			name: itemName,
			value: allIDs[index]
		};
	});
	const uploadResult = await dispatch(
		{
			type: "CreateDocAction",
			project: auth.projectName,
			user: auth.projectUser,
			data: JSON.stringify({
				type: "Folder",
				files
			})
		},
		auth
	);
	return uploadResult.docId;
}

async function upload() {
	const auth = {
		...JSON.parse(fs.readFileSync(join(process.cwd(), ".avenconfig")))
	};
	if (auth.projectUser !== auth.username) {
		throw "Cannot upload a project that is not yours";
	}
	const rootDoc = await putFolderObject(auth, process.cwd());
	const uploadResult = await dispatch(
		{
			type: "SetProjectAction",
			projectName: auth.projectName,
			rootDoc
		},
		auth
	);

	console.log("uploading..", uploadResult);
}

commander
	.version("0.1.0")
	.parse(process.argv);

upload()
	.then(() => {
		console.log("Upload completed!");
	})
	.catch(e => {
		console.log("Upload failure!");
		console.error(e);
	});
