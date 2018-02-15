const pathJoin = require("path").join;
// const FSAgent = require("./FSAgent");
const runInit = require("./CLI-Init");
const runStart = require("./CLI-Start");

// const CONFIG_DEFAULTS = {
//   host: "aven.io",
//   useSSL: true,
//   authUser: null,
//   authSession: null,
//   syncDirectoryRecord: null,
//   syncDirectoryPath: null,
// };

async function runCLI({ args, cwd }) {
  const cmd = args[0];

  if (cmd === "init") {
    await runInit();
  } else if (cmd === "start" || cmd === "") {
    await runStart();
  } else {
    throw 'Invalid command "${cmd}"';
  }
}

//   const sibs = await readdir(cwd);

//   let walkPath = cwd;
//   let configData = {};
//   while (walkPath !== "/") {
//     let pathData = null;
//     try {
//       const configJson = await readFile(
//         pathJoin(walkPath, ".AvenContext.json"),
//         {
//           encoding: "utf8",
//         },
//       );
//       pathData = JSON.parse(configJson);
//     } catch (e) {}
//     if (pathData) {
//       configData = {
//         ...pathData,
//         ...configData,
//       };
//     }
//     walkPath = pathJoin(walkPath, "..");
//   }

//   configData = {
//     ...CONFIG_DEFAULTS,
//     ...configData,
//   };

//   const {
//     authUser,
//     authSession,
//     useSSL,
//     host,
//     syncDirectoryRecord,
//     syncDirectoryPath,
//   } = configData;

//   if (!authSession || !authUser) {
//     console.log(
//       "Could not find your user or session. The .AvenConfig.json files are misconfigured. todo: build authentication flows into CLI",
//     );
//     return;
//   }

//   if (!syncDirectoryRecord || !syncDirectoryPath) {
//     console.log(
//       "Could not identify the directory or record to sync to. The .AvenConfig.json files are misconfigured. Todo: directory initialization in CLI",
//     );
//     return;
//   }

//   const dispatch = async action => {
//     const res = await fetch();
//     const result = await fetch(
//       `${useSSL ? "https" : "http"}://${host}/api/dispatch`,
//       {
//         method: "POST",
//         body: JSON.stringify({
//           authUser,
//           authSession,
//           ...action,
//         }),
//         headers: {
//           "Content-Type": "application/json",
//         },
//       },
//     );
//     if (result.status < 300) {
//       const jsonResponse = await result.json();
//       console.log("action success ", action, jsonResponse);
//       return jsonResponse;
//     } else {
//       console.error(await result.text());
//       throw "Fail";
//     }
//   };

//   const fsAgent = await FSAgent({ dispatch, authUser, authSession });

//   if (configData) {
//     console.log("AvenConfig data is", configData);
//   } else {
//     console.log("Could not find configData. !");
//   }
// }

const args = process.argv.slice(2);
const cwd = process.cwd();

runCLI({ args, cwd })
  .then(() => {
    console.log("");
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
