import { FastifyAuthFunction } from "@fastify/auth"
import fp from "fastify-plugin"

import { validateSessionToken } from "@web-app/auth"
import { Session, User } from "@web-app/db"

declare module "fastify" {
  export interface FastifyInstance {
    validateSession: FastifyAuthFunction
  }

  export interface FastifyRequest {
    session?: Session
    user?: User
  }
}

export const sessionMiddleware = fp(function (app) {
  app.decorateRequest("session")
  app.decorateRequest("user")

  app.decorate<FastifyAuthFunction>(
    "validateSession",
    async function (req, rep) {
      // Get token from request cookies
      const token = ""
      // If token is not present, return an error
      if (!token) {
        console.log("Token missing from request")
        return rep
          .status(401)
          .send({ error: "Unauthorized: Invalid request token" })
      }
      // Get session and user from token
      const { session, user } = await validateSessionToken(token)
      // If session or user is not present, return an error
      if (!session || !user) {
        console.log("Session or user not found")
        return rep
          .status(401)
          .send({ error: "Unauthorized: Session could not be validated" })
      }
      // Attach session and user to request object
      req.user = user
      req.session = session
      // Continue with request
      return rep
    },
  )
})
