const join = require("path").join;
const commander = require("commander");
const watchr = require("watchr");

const { fsReadFile, download, upload } = require("./CLI-utilities");

require("babel-core/register");
require("babel-polyfill");

const go = async () => {
  const auth = {
    ...JSON.parse(await fsReadFile(join(process.cwd(), ".avenconfig")))
  };

  await download(auth, process.cwd());

  const path = process.cwd();
  async function listener(changeType, fullPath, currentStat, previousStat) {
    switch (changeType) {
      case "update":
        await upload(auth, path);
        console.log("Changes uploaded!");
        break;
      case "create":
        await upload(auth, path);
        console.log("Changes uploaded!");
        break;
      case "delete":
        await upload(auth, path);
        console.log("Changes uploaded!");
        break;
    }
  }

  return new Promise((resolve, reject) => {
    const stalker = watchr.open(path, listener, function(err) {
      console.log("lolwat", err);
      if (err) return reject(err);
      console.log("watch successful on", path);
      resolve();
    });
  });

  console.log("Download completed and ready to listen!");
};

commander.version("0.1.0").parse(process.argv);

go(commander.server)
  .then(() => {
    console.log("Started!");
  })
  .catch(e => {
    console.log("Start failure!");
    console.error(e);
  });

// stalker.close()
