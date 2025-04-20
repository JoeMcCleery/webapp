import { FastifyAuthFunction } from "@fastify/auth"
import fp from "fastify-plugin"

import { tokenBucketConsume } from "@web-app/auth"

type TokenBucketConsumeFunction = (cost: number) => FastifyAuthFunction

declare module "fastify" {
  export interface FastifyInstance {
    tokenBucketConsume: TokenBucketConsumeFunction
  }
}

export const tokenBucketMiddleware = fp(function (app) {
  app.decorate<TokenBucketConsumeFunction>(
    "tokenBucketConsume",
    function (cost = 1) {
      return function (req, rep) {
        // Check user token limits
        if (!tokenBucketConsume(req.user!.id, cost)) {
          console.log(`Not enough tokens for user id: ${req.user!.id}`)
          return rep
            .status(429)
            .send({ error: "Too many requests: Not enough tokens" })
        }
        // Continue with request
        return rep
      }
    },
  )
})
