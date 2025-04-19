import { FastifyAuthFunction } from "@fastify/auth"
import fp from "fastify-plugin"

import { tokenBucketConsume, validateSessionToken } from "@web-app/auth"
import { Session, User } from "@web-app/db"

type TokenBucketConsumeFunction = (cost: number) => FastifyAuthFunction

declare module "fastify" {
  export interface FastifyInstance {
    validateSession: FastifyAuthFunction
    tokenBucketConsume: TokenBucketConsumeFunction
  }

  export interface FastifyRequest {
    session?: Session
    user?: User
  }
}

export const authMiddleware = fp(function (app) {
  app.decorateRequest("session")
  app.decorateRequest("user")

  app.decorate<FastifyAuthFunction>(
    "validateSession",
    async function (req, rep) {
      // Get token from request cookies
      const token = "test-token"
      // If token is not present, return an error
      if (!token) {
        console.log("Token missing from request")
        return rep.status(401).send({ error: "Unauthorized" })
      }
      // Get session and user from token
      const { session, user } = await validateSessionToken(token)
      // If session or user is not present, return an error
      if (!session || !user) {
        console.log("Session or user not found")
        return rep.status(401).send({ error: "Unauthorized" })
      }
      // Attach session and user to request object
      req.user = user
      req.session = session
    },
  )

  app.decorate<TokenBucketConsumeFunction>(
    "tokenBucketConsume",
    function (cost = 1) {
      return async function (req, rep) {
        // Check user token limits
        if (!tokenBucketConsume(req.user!.id, cost)) {
          console.log(
            `Token bucket limit exceeded for user id: ${req.user!.id}`,
          )
          return rep.status(429).send({ error: "Too many requests" })
        }
      }
    },
  )
})
