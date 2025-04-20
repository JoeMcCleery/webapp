import { FastifyPluginCallback } from "fastify"

export const user: FastifyPluginCallback = function (app) {
  app.addHook(
    "onRequest",
    app.auth([app.validateSession, app.tokenBucketConsume(1)]),
  )

  app.post("", async function (req, rep) {
    // Send user object back to client
    rep.status(200).send({ user: req.user })
  })
}
