import type { FastifyPluginCallback } from "fastify"

import {
  invalidatePasswordReset,
  invalidateSession,
  tokenBucketConsume,
  validatePasswordReset,
} from "@webapp/auth"
import { getEnhancedPrisma } from "@webapp/orm"

export const resetPassword: FastifyPluginCallback = function (app) {
  app.post<{
    Body: {
      newPassword: string
      confirmPassword: string
      persist: boolean
      token: string
      otpToken: string
    }
  }>("", async function (req, rep) {
    // Get data from request body
    const { newPassword, confirmPassword, token, otpToken, persist } = req.body
    // Verify password reset
    const { passwordReset, user } = await validatePasswordReset(token, otpToken)
    // If password reset or user not present, return error
    if (!passwordReset || !user) {
      console.log("Password reset or user not found")
      return rep.unauthorized("Invalid password reset request")
    }
    // Check user token limits
    if (!tokenBucketConsume(user.id, 1)) {
      console.log(`Not enough tokens for user id: ${req.user!.id}`)
      return rep.tooManyRequests("Not enough tokens")
    }
    // Verify new password
    if (newPassword !== confirmPassword) {
      console.log("Resetting password faild, passwords did not match")
      return rep.unprocessableEntity("Passwords did not match")
    }
    // Safely set new user password
    const enhancedPrisma = getEnhancedPrisma({ user })
    await enhancedPrisma.user.update({
      where: { id: user.id },
      data: { password: newPassword },
    })
    // Invalidate password reset
    await invalidatePasswordReset(user)
    // Invalidate existing session
    if (req.user && req.session) {
      await invalidateSession(req.user, req.session.id)
    }
    // Create new user session
    const csrfToken = await rep.createUserSession(user, persist)
    // Success
    return rep.status(200).send(csrfToken)
  })
}
