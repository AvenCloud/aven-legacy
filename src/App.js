const express = require("express")
const DB = require("./DB")
const bodyParser = require("body-parser")
const Dispatch = require("./Dispatch")

module.exports = async infra => {
  const app = express()

  app.infra = infra
  app.model = DB.create(infra)

  app.get("/api/debug", async (req, res) => {
    res.json(await infra.getPublicDebugInfo())
  })

  app.post("/api/dispatch", bodyParser.json(), async (req, res) => {
    let result = null
    const action = req.body
    try {
      result = await Dispatch(action, app)
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

  app.close = async () => {
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
