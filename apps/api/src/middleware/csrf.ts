import type { FastifyAuthFunction } from "@fastify/auth"
import type { FastifyReply, FastifyRequest } from "fastify"
import fp from "fastify-plugin"

import { createCSRFToken, invalidateSession, validateCSRF } from "@webapp/auth"
import type { Session } from "@webapp/orm"

declare module "fastify" {
  interface FastifyInstance {
    validateCSRF: FastifyAuthFunction
  }

  interface FastifyRequest {
    getCSRFToken(): string | undefined
  }

  interface FastifyReply {
    setCSRFCookie(session: Session): FastifyReply
    clearCSRFCookie(): FastifyReply
  }
}

const cookieName = "__Secure-csrf"
const headerName = "X-CSRF-TOKEN"

export const csrfMiddleware = fp(function (app) {
  app.decorateRequest("getCSRFToken", function (this: FastifyRequest) {
    const cookie = this.cookies[cookieName]
    const header = this.headers[headerName]
    if (!cookie || !header || cookie !== header) {
      return undefined
    }
    return cookie
  })

  app.decorateReply(
    "setCSRFCookie",
    function (this: FastifyReply, session: Session) {
      const csrfToken = createCSRFToken(session.id)
      return this.setCookie(cookieName, csrfToken, {
        expires: session.expiresAt,
      })
    },
  )

  app.decorateReply("clearCSRFCookie", function (this: FastifyReply) {
    return this.clearCookie(cookieName)
  })

  app.decorate<FastifyAuthFunction>("validateCSRF", async function (req, rep) {
    // Get the current session and user
    const { session, user } = req
    // If session or user is not present
    if (!session || !user) {
      console.log("Could not validate CSRF, session or user not found")
      req.session = undefined
      req.user = undefined
      return
    }
    // Get CSRF token from request cookies and headers
    const csrfToken = req.getCSRFToken()
    // If CSRF token is not present
    if (!csrfToken) {
      console.log("Missing CSRF token")
      // Clear CSRF cookie (in case it was just the header missing)
      rep.clearCSRFCookie()
      // Invalidate session
      await invalidateSession(user, session.id)
      rep.clearSessionCookie()
      req.session = undefined
      req.user = undefined
      return
    }
    // Validate the CSRF token
    const valid = validateCSRF(session.id, csrfToken)
    // If CSRF token is not valid
    if (!valid) {
      console.log("Invalid CSRF token")
      // Clear CSRF cookie
      rep.clearCSRFCookie()
      // Invalidate session
      await invalidateSession(user, session.id)
      rep.clearSessionCookie()
      req.session = undefined
      req.user = undefined
      return
    }
    // Refresh CSRF cookie
    rep.setCSRFCookie(session)
    // Continue with request
    return
  })
})
