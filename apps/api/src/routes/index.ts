import type { FastifyPluginCallback } from "fastify"

import { auth } from "./auth"
import { trpc } from "./trpc"

export const routes: FastifyPluginCallback = function (app) {
  app.addHook(
    "onRequest",
    app.auth([
      app.throttlerConsume,
      app.validateSession,
      app.validateCSRF,
      app.tokenBucketConsume(1),
    ]),
  )
  app.addHook("onResponse", app.auth([app.throttlerReset]))

  app.register(trpc, { prefix: "/trpc" })
  app.register(auth, { prefix: "/auth" })
}
