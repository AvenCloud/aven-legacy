const express = require("express")
const DB = require("./DB")
const LocalAppLoader = require("./LocalAppLoader")
const bodyParser = require("body-parser")
const createDispatcher = require("./Dispatch")

module.exports = async infra => {
  const app = express()

  app.infra = infra
  app.model = DB.create(infra)

  app.dispatch = createDispatcher(app)

  app.get("/api/debug", async (req, res) => {
    res.json(await infra.getPublicDebugInfo())
  })

  app.post("/api/dispatch", bodyParser.json(), async (req, res) => {
    let result = null
    const action = req.body
    try {
      result = await app.dispatch(action)
      res.json(result)
    } catch (e) {
      // avoid logging expected errors during test runs:
      if (
        infra.env !== "testing" ||
        req.headers["x-aven-test"] !== "expect-error"
      ) {
        console.error(e)
      }
      res.status(e.statusCode || 500).json(e)
    }
  })

  app.get("*", async (req, res) => {
    const { id } = await app.dispatch.GetRecordAction({ recordId: "App" })
    console.log("haz id", id)
    const doc = await app.dispatch.GetDocAction({ docId: id })

    console.log("ok!", id)
    res.send(req.path)
  })

  const server = await new Promise((resolve, reject) => {
    const httpServer = app.listen(infra.appListenPort, err => {
      if (err) {
        reject(err)
      } else {
        resolve(httpServer)
      }
    })
  })

  let closeLocalLoader = () => {}
  if (process.env.NODE_ENV === "development") {
    try {
      closeLocalLoader = await LocalAppLoader.start(app)
    } catch (e) {
      console.error("Could not load local 'app' folder!", e)
    }
  }

  app.close = async () => {
    await closeLocalLoader()
    await infra.close()
    await new Promise((resolve, reject) => {
      server.close(function(err) {
        if (err) {
          reject(err)
        } else {
          setTimeout(() => {
            resolve()
          }, 200)
        }
      })
    })
  }

  return app
}
