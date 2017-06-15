const crypto = require("crypto");
const denodeify = require("denodeify");
const randomBytes = denodeify(crypto.randomBytes);

async function genSessionId() {
  const randBuf = await randomBytes(48);
  return randBuf.toString("hex");
}

export default {
  genSessionId
};
