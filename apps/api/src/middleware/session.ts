import type { FastifyAuthFunction } from "@fastify/auth"
import type { FastifyReply, FastifyRequest } from "fastify"
import fp from "fastify-plugin"

import { createSession, validateSessionToken } from "@webapp/auth"
import { generateUniqueToken } from "@webapp/auth-utils"
import type { AuthUser, Session } from "@webapp/orm"

declare module "fastify" {
  interface FastifyInstance {
    validateSession: FastifyAuthFunction
  }

  interface FastifyRequest {
    session?: Session
    user?: AuthUser
    getSessionCookie(): string | undefined
  }

  interface FastifyReply {
    setSessionCookie(token: string, expires?: Date): FastifyReply
    clearSessionCookie(): FastifyReply
    createUserSession(user: AuthUser, persist: boolean): Promise<string>
  }
}

const cookieName = "__Secure-session"

export const sessionMiddleware = fp(function (app) {
  app.decorateRequest("session")
  app.decorateRequest("user")

  app.decorateRequest("getSessionCookie", function (this: FastifyRequest) {
    return this.cookies[cookieName]
  })

  app.decorateReply(
    "setSessionCookie",
    function (this: FastifyReply, token: string, expires?: Date) {
      return this.setCookie(cookieName, token, { expires })
    },
  )

  app.decorateReply("clearSessionCookie", function (this: FastifyReply) {
    return this.clearCookie(cookieName)
  })

  app.decorateReply(
    "createUserSession",
    async function (this: FastifyReply, user: AuthUser, persist: boolean) {
      // Create new session
      const token = generateUniqueToken()
      const session = await createSession(token, user, persist)
      // Set session cookies
      this.setSessionCookie(token, persist ? session.expiresAt : undefined)
      // Set csrf cookie
      const csrfToken = this.setCSRFCookie(session)
      // Return csrf token
      return csrfToken
    },
  )

  app.decorate<FastifyAuthFunction>(
    "validateSession",
    async function (req, rep) {
      // Get token from request cookies
      const token = req.getSessionCookie()
      // If token is not present
      if (!token) {
        console.log("Missing session token")
        return
      }
      // Get session and user from token
      const { session, user } = await validateSessionToken(token)
      // If session or user is not present
      if (!session || !user) {
        console.log("Session or user not found")
        // Clear session cookie
        rep.clearSessionCookie()
        return
      }
      // Refresh the session cookie
      rep.setSessionCookie(
        token,
        session.persist ? session.expiresAt : undefined,
      )
      // Attach session and user to request object
      req.user = user
      req.session = session
      // Continue with request
      return
    },
  )
})
