import type { FastifyAuthFunction } from "@fastify/auth"
import fp from "fastify-plugin"

import { tokenBucketConsume } from "@webapp/auth"

type TokenBucketConsumeFunction = (cost: number) => FastifyAuthFunction

declare module "fastify" {
  interface FastifyInstance {
    tokenBucketConsume: TokenBucketConsumeFunction
  }
}

export const tokenBucketMiddleware = fp(function (app) {
  app.decorate<TokenBucketConsumeFunction>(
    "tokenBucketConsume",
    function (cost = 1) {
      return function (req, rep, done) {
        // Check user token limits
        if (req.user && !tokenBucketConsume(req.user.id, cost)) {
          console.log(`Not enough tokens for user id: ${req.user.id}`)
          rep
            .status(429)
            .send({ error: "Too many requests: Not enough tokens" })
          // Request failed
          return done(new Error())
        }
        // Continue with request
        return done()
      }
    },
  )
})
