const fetch = require("node-fetch")
const fileType = require("file-type")
const { promisify } = require("bluebird")
const fs = require("fs-extra")
const stringify = require("json-stable-stringify")
const { join } = require("path")
const { digest } = require("../src/Utilities")

const isBinaryFile = promisify(require("isbinaryfile"))

function FSClient({ dispatch, authUser, authSession }) {
  async function checksumFile(path) {
    const file = await fs.readFile(path)
    const isBinary = await isBinaryFile(file, file.length)
    let fileValue = null
    if (isBinary) {
      // set fileValue to some special binary thing
      throw "Cannot put binary files yet!"
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
    const fileNames = await fs.readdir(path)
    const files = await Promise.all(
      fileNames.sort().map(async fileName => {
        const filePath = join(path, fileName)
        const docID = await checksumPath(filePath)
        return { docID, fileName }
      }),
    )
    return {
      type: "Directory",
      files,
    }
  }

  async function checksumDirectory(path) {
    const dirSummary = await readDirectory(path)
    const checksum = digest(stringify(dirSummary))
    return checksum
  }

  async function checksumPath(path) {
    const stat = await fs.lstat(path)
    if (stat.isDirectory()) {
      return checksumDirectory(path)
    } else {
      return checksumFile(path)
    }
  }

  async function putFile(path, recordID) {
    const file = await fs.readFile(path)
    const isBinary = await isBinaryFile(file, file.length)
    let fileValue = null
    if (isBinary) {
      // set fileValue to some special binary thing
      throw "Cannot put binary files yet!"
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

  async function putDirectory(path, recordID) {
    const dirValue = await readDirectory(path)

    await Promise.all(
      dirValue.files.map(async file => {
        const filePath = join(path, file.fileName)
        await putPath(filePath, recordID)
      }),
    )
    const createDoc = await dispatch({
      type: "CreateDocAction",
      recordID,
      authSession,
      authUser,
      value: dirValue,
    })

    return createDoc
  }

  async function putPath(path, recordID) {
    const stat = await fs.lstat(path)
    if (stat.isDirectory()) {
      return await putDirectory(path, recordID)
    } else {
      return await putFile(path, recordID)
    }
  }

  async function uploadPath(path, recordID) {
    let record = await dispatch({
      type: "GetRecordAction",
      recordID,
      authSession,
      authUser,
    })
    if (!record) {
      record = await dispatch({
        type: "SetRecordAction",
        recordID,
        authSession,
        authUser,
        doc: null,
        permission: "PUBLIC",
        owner: authUser,
      })
    }
    const putResult = await putPath(path, recordID)
    await dispatch({
      type: "SetRecordAction",
      recordID,
      authSession,
      authUser,
      doc: putResult.docID,
      permission: "PUBLIC",
      owner: authUser,
    })
    return {
      recordID,
      docID: putResult.docID,
    }
  }

  async function getPath(path, recordID, docID) {
    const doc = await dispatch({
      type: "GetDocAction",
      recordID,
      docID,
      authUser,
      authSession,
    })
    const pathExists = await fs.pathExists(path)
    if (pathExists) {
      throw "Not supported yet! Rm path before downloading, or fix this code"
    }
    if (doc.value.type === "Directory") {
      await fs.mkdir(path)
      await Promise.all(
        doc.value.files.map(async file => {
          const filePath = join(path, file.fileName)
          await getPath(filePath, recordID, file.docID)
        }),
      )
    } else if (doc.value.type === "String") {
      await fs.writeFile(path, doc.value.value)
    } else {
      await fs.writeFile(path, stringify(doc.value))
    }
  }

  async function downloadPath(path, recordID) {
    const record = await dispatch({
      type: "GetRecordAction",
      recordID,
      authSession,
      authUser,
    })
    if (!record || !record.doc) {
      throw "Cannot find record!!:!?" // todo, consistent error handling on client
    }
    await getPath(path, recordID, record.doc)
  }

  return {
    checksumFile,
    checksumDirectory,
    checksumPath,
    putFile,
    putDirectory,
    putPath,
    uploadPath,
    getPath,
    downloadPath,
  }
}

module.exports = FSClient
