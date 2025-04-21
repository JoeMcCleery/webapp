import { FastifyPluginCallback } from "fastify"

import { getEnhancedPrisma } from "@web-app/orm"

export const user: FastifyPluginCallback = function (app) {
  app.addHook(
    "onRequest",
    app.auth([app.validateSession, app.tokenBucketConsume(1)]),
  )

  app.post("", function (req, rep) {
    // Check user exists
    if (req.user) {
      // Get safe user
      const prisma = getEnhancedPrisma({ user: req.user })
      const user = prisma.user.findUnique({ where: { id: req.user.id } })
      // Send user object back to client
      console.log("Send authenticated user obect to client")
      return rep.status(200).send({ user })
    }
    console.log("No authenticated user, sending null user to client")
    return rep.status(200).send({ user: null })
  })
}
