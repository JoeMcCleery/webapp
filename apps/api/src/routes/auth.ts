import type { FastifyPluginCallback } from "fastify"

import { login, logout, logoutAll } from "../controllers/auth"

export const auth: FastifyPluginCallback = function (app) {
  app.register(login, { prefix: "/login" })
  app.register(logout, { prefix: "/logout" })
  app.register(logoutAll, { prefix: "/logout-all" })
}
