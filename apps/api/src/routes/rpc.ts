import { ZenStackFastifyPlugin } from "@zenstackhq/server/fastify"
import type { FastifyPluginCallback } from "fastify"

import { getEnhancedPrisma } from "@webapp/orm"

export const rpc: FastifyPluginCallback = function (app) {
  app.addHook(
    "onRequest",
    app.auth([app.validateSession, app.tokenBucketConsume(1)]),
  )

  app.register(ZenStackFastifyPlugin, {
    prefix: "",
    getPrisma: function (req, rep) {
      return getEnhancedPrisma({ user: req.user })
    },
  })
}
