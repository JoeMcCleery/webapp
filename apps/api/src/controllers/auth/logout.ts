import { FastifyPluginCallback } from "fastify"

import { invalidateAllSessions, invalidateSession } from "@web-app/auth"

export const logout: FastifyPluginCallback = async function (app) {
  app.addHook("onRequest", app.auth([app.validateSession]))

  app.post("", async function (req, rep) {
    // Check user and session exist
    if (req.user && req.session) {
      // Invalidate session
      await invalidateSession(req.user, req.session.id)
    }
    return rep.status(200).send()
  })
}

export const logoutAll: FastifyPluginCallback = function (app) {
  app.addHook("onRequest", app.auth([app.validateSession]))

  app.post("", async function (req, rep) {
    // Check user and session exist
    if (req.user && req.session) {
      // Invalidate all sessions
      await invalidateAllSessions(req.user)
    }
    return rep.status(200).send()
  })
}
