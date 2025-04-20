import { FastifyPluginCallback } from "fastify"

import { invalidateAllSessions, invalidateSession } from "@web-app/auth"

export const logout: FastifyPluginCallback = async function (app) {
  app.addHook("onRequest", app.auth([app.validateSession]))

  app.post("", async function (req, rep) {
    // Invalidate session
    await invalidateSession(req.session!.id)
  })
}

export const logoutAll: FastifyPluginCallback = function (app) {
  app.addHook("onRequest", app.auth([app.validateSession]))

  app.post("", async function (req, rep) {
    // Invalidate all sessions
    await invalidateAllSessions(req.user!.id)
  })
}
