import fp from "fastify-plugin"

import { sessionMiddleware } from "./session"
import { throttlerMiddleware } from "./throttler"
import { tokenBucketMiddleware } from "./token-bucket"

export const middleware = fp(function (app) {
  app.register(sessionMiddleware)
  app.register(tokenBucketMiddleware)
  app.register(throttlerMiddleware)
})
