const mime = require("mime-types")

async function ExecDocAtPath(app, path, docID, res, context = []) {
  console.log("ExecDocAtPath", path, docID)

  const doc = await app.dispatch.GetDocAction({
    docID: docID,
    recordID: "App",
  })

  if (!doc) {
    throw {
      statusCode: 404,
      code: "INVALID_DOC",
      message: `Doc not found for path`,
    }
  }

  if (path === "") {
    const type = doc.value.type
    const fileName = context && context[0] && context[0].fileName
    const contentType = fileName && mime.lookup(fileName)
    contentType && res.set({ "content-type": contentType })
    switch (type) {
      case "Buffer": {
        const buf = Buffer.from(doc.value.value, "base64")
        res.send(buf)
        return
      }
      case "String": {
        res.send(doc.value.value)
        return
      }
      case "Directory": {
        const indexTypes = ["html", "js"]
        let foundIndexFile = null
        indexTypes.find(indexType =>
          doc.value.files.find(file => {
            if (file.fileName === `index.${indexType}`) {
              foundIndexFile = file
              return true
            }
          }),
        )
        if (foundIndexFile && foundIndexFile.docID) {
          const pathParts = path.split("/")
          const childPath = pathParts.slice(1).join("/")
          const childDocID = foundIndexFile.docID
          return await ExecDocAtPath(app, childPath, childDocID, res, [
            foundIndexFile,
            ...context,
          ])
        }
        res.json(doc.value)
        return
      }
      default: {
        res.json(doc.value)
        return
      }
    }
  }

  if (!doc.value || doc.value.type !== "Directory") {
    throw {
      statusCode: 404,
      code: "INVALID_DOC",
      message: `Doc is not a directory`,
    }
  }

  const pathParts = path.split("/")

  let selectedFile = null
  doc.value.files.find(file => {
    if (file.fileName === pathParts[0]) {
      selectedFile = file
      return true
    }
    return false
  })

  if (!selectedFile) {
    throw {
      statusCode: 404,
      code: "INVALID_PATH",
      message: `Path is not valid`,
      fields: path,
    }
  }

  const childPath = pathParts.slice(1).join("/")
  const childDocID = selectedFile && selectedFile.docID
  if (childDocID) {
    return await ExecDocAtPath(app, childPath, childDocID, res, [
      selectedFile,
      ...context,
    ])
  }

  throw {
    code: 500,
    message: "Cannot handle this file",
    fields: { doc },
  }
}

async function ExecServerApp(app, req, res) {
  const result = await app.dispatch.GetRecordAction({ recordID: "App" })
  if (!result || !result.doc) {
    throw {
      statusCode: 404,
      code: "INVALID_APP",
      message: "App Record doc not found!",
    }
  }
  const topPath = req.path.slice(1)
  await ExecDocAtPath(app, topPath, result.doc, res)
}

module.exports = ExecServerApp
