import type { FastifyPluginCallback } from "fastify"

import { invalidateAllSessions, invalidateSession } from "@webapp/auth"

export const logout: FastifyPluginCallback = async function (app) {
  app.post("", async function (req, rep) {
    // Check user and session exist
    if (req.user && req.session) {
      // Invalidate session
      await invalidateSession(req.user, req.session.id)
    }
    // Clear session cookie
    rep.clearSessionCookie()
    // Success
    return rep.status(200).send()
  })
}

export const logoutAll: FastifyPluginCallback = function (app) {
  app.post("", async function (req, rep) {
    // Check user and session exist
    if (req.user && req.session) {
      // Invalidate all sessions
      await invalidateAllSessions(req.user)
    }
    // Clear session cookie
    rep.clearSessionCookie()
    // Success
    return rep.status(200).send()
  })
}
