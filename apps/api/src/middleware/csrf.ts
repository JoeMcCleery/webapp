import type { FastifyAuthFunction } from "@fastify/auth"
import type { FastifyReply, FastifyRequest } from "fastify"
import fp from "fastify-plugin"

import { validateCSRF } from "@webapp/auth"

declare module "fastify" {
  interface FastifyInstance {
    validateCSRF: FastifyAuthFunction
  }

  interface FastifyRequest {
    getCSRFCookie(): string | undefined
  }

  interface FastifyReply {
    setCSRFCookie(token: string, expires: Date): FastifyReply
    clearCSRFCookie(): FastifyReply
  }
}

const cookieName = "__Secure-csrf"

export const csrfMiddleware = fp(function (app) {
  app.decorateRequest("getCSRFCookie", function (this: FastifyRequest) {
    return this.cookies[cookieName]
  })

  app.decorateReply(
    "setCSRFCookie",
    function (this: FastifyReply, token: string, expires: Date) {
      return this.setCookie(cookieName, token, { expires })
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
    // Get CSRF token from request cookies
    const csrfToken = req.getCSRFCookie()
    // If CSRF token is not present
    if (!csrfToken) {
      console.log("Missing CSRF token")
      rep.status(401)
      throw new Error("Unauthorized: Invalid or missing CSRF token")
    }
    // Validate the CSRF token
    const valid = validateCSRF(session.id, csrfToken)
    // If CSRF token is not valid
    if (!valid) {
      console.log("Invalid CSRF token")
      // Clear CSRF cookie
      rep.clearCSRFCookie()
      rep.status(401)
      throw new Error("Unauthorized: Invalid or missing CSRF token")
    }
    // Continue with request
    return
  })
})
