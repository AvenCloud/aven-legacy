const crypto = require("crypto")
const bcrypt = require("bcrypt-nodejs")
const { promisify } = require("bluebird")
const randomBytes = promisify(crypto.randomBytes)

function digest(input) {
  const shasum = crypto.createHash("sha1")
  shasum.update(input)
  return shasum.digest("hex")
}

async function genSessionId() {
  const randBuf = await randomBytes(48)
  return randBuf.toString("hex")
}

async function genAuthCode() {
  const randBuf = await randomBytes(48)
  const hex = randBuf.toString("hex")
  const int = parseInt(hex, 16)
  const intStr = String(int)
  return intStr.substr(3, 6)
}

async function genClientId() {
  const randBuf = await randomBytes(48)
  const hex = randBuf.toString("hex")
  return hex
}

async function genHash(input) {
  return new Promise((resolve, reject) => {
    bcrypt.hash(input, null, null, (err, hash) => {
      if (err) {
        reject(err)
        return
      }
      resolve(hash)
    })
  })
}

async function compareHash(input, hash) {
  return new Promise((resolve, reject) => {
    bcrypt.compare(input, hash, (err, result) => {
      if (err) {
        reject(err)
        return
      }
      resolve(result)
    })
  })
}

module.exports = {
  genSessionId,
  digest,
  genHash,
  compareHash,
  genAuthCode,
  genClientId,
}
