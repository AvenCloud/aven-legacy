const fetch = require("node-fetch")
const fileType = require("file-type")
const { promisify } = require("bluebird")
const fs = require("fs")
const stringify = require("json-stable-stringify")
const { join } = require("path")
const { digest } = require("../src/Utilities")

const fsMkdir = promisify(fs.mkdir)
const fsReaddir = promisify(fs.readdir)
const fsWriteFile = promisify(fs.writeFile)
const fsLstat = promisify(fs.lstat)
const fsReadFile = promisify(fs.readFile)
const isBinaryFile = promisify(require("isbinaryfile"))

async function checksumFile(path) {
  const file = await fsReadFile(path)
  const isBinary = await isBinaryFile(file, file.length)
  let fileValue = null
  if (isBinary) {
    // set fileValue to some special binary thing
    throw "Cannot upload binary files yet!"
  } else {
    try {
      fileValue = JSON.parse(file)
    } catch (e) {
      fileValue = { type: "String", value: file.toString() }
    }
  }
  const id = digest(stringify(fileValue))
  return id
}

async function readDirectory(path) {
  const files = await fsReaddir(path)
  const dirSummary = await Promise.all(
    files.sort().map(async fileName => {
      const filePath = join(path, fileName)
      const id = await checksumPath(filePath)
      return { id, fileName }
    }),
  )
  return {
    type: "Directory",
    files: dirSummary,
  }
}

async function checksumDirectory(path) {
  const dirSummary = readDirectory(path)
  const checksum = digest(stringify(dirSummary))
  return checksum
}

async function checksumPath(path) {
  const stat = await fsLstat(path)
  if (stat.isDirectory()) {
    return checksumDirectory(path)
  } else {
    return checksumFile(path)
  }
}

async function uploadFile(path, opts) {
  const { authSession, authUser, dispatch, recordID } = opts

  const file = await fsReadFile(path)
  const isBinary = await isBinaryFile(file, file.length)
  let fileValue = null
  if (isBinary) {
    // set fileValue to some special binary thing
    throw "Cannot upload binary files yet!"
  } else {
    try {
      fileValue = JSON.parse(file)
    } catch (e) {
      fileValue = { type: "String", value: file.toString() }
    }
  }

  const createDoc = await dispatch({
    type: "CreateDocAction",
    recordID,
    authSession,
    authUser,
    value: fileValue,
  })

  return createDoc
}

async function uploadDirectory(path, opts) {
  const { authSession, authUser, dispatch, recordID } = opts
  const dirValue = readDirectory(path)

  const createDoc = await dispatch({
    type: "CreateDocAction",
    recordID,
    authSession,
    authUser,
    value: dirValue,
  })

  return createDoc
}

async function uploadPath(path, opts) {
  const stat = await fsLstat(path)
  if (stat.isDirectory()) {
    return uploadDirectory(path, opts)
  } else {
    return uploadFile(path, opts)
  }
}

module.exports = {
  checksumFile,
  checksumDirectory,
  checksumPath,
  uploadFile,
  uploadDirectory,
  uploadPath,
}
