const join = require("path").join;
const commander = require("commander");
const prompt = require("prompt");

const {
  dispatch,
  fsExists,
  fsMkdir,
  fsReaddir,
  fsLstat,
  fsReadFile,
  download
} = require("./CLI-utilities");

require("babel-core/register");
require("babel-polyfill");

const doDownload = async () => {
  const auth = {
    ...JSON.parse(await fsReadFile(join(process.cwd(), ".avenconfig")))
  };

  await download(auth, process.cwd());
};

commander.version("0.1.0").parse(process.argv);

doDownload(commander.server)
  .then(() => {
    console.log("Download completed!");
  })
  .catch(e => {
    console.log("Download failure!");
    console.error(e);
  });
