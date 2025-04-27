import type { FastifyPluginCallback } from "fastify"

import { auth } from "./auth"
import { rpc } from "./rpc"

export const routes: FastifyPluginCallback = function (app) {
  app.addHook(
    "onRequest",
    app.auth([
      app.throttlerConsume,
      app.validateSession,
      app.tokenBucketConsume(1),
    ]),
  )
  app.addHook("onResponse", app.auth([app.throttlerReset]))

  app.register(rpc, { prefix: "/rpc" })
  app.register(auth, { prefix: "/auth" })
}
