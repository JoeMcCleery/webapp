import { ZenStackFastifyPlugin } from "@zenstackhq/server/fastify"
import type { FastifyPluginCallback } from "fastify"

import { getEnhancedPrisma } from "@webapp/orm"

export const rpc: FastifyPluginCallback = function (app) {
  app.register(ZenStackFastifyPlugin, {
    prefix: "",
    getPrisma: function (req, rep) {
      return getEnhancedPrisma({ user: req.user })
    },
  })
}
