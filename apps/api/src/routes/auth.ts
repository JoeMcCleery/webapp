import type { FastifyPluginCallback } from "fastify"

import {
  forgotPassword,
  login,
  logout,
  logoutAll,
  resetPassword,
  signup,
  user,
} from "../controllers/auth"
import { confirmOTP } from "../controllers/auth/confirm-otp"

export const auth: FastifyPluginCallback = function (app) {
  app.register(login, { prefix: "/login" })
  app.register(logout, { prefix: "/logout" })
  app.register(logoutAll, { prefix: "/logout-all" })
  app.register(user, { prefix: "/user" })
  app.register(signup, { prefix: "/signup" })
  app.register(forgotPassword, { prefix: "/forgot-password" })
  app.register(confirmOTP, { prefix: "/confirm-otp" })
  app.register(resetPassword, { prefix: "/reset-password" })
}
