import type { FastifyPluginCallback } from "fastify"

import {
  createSession,
  generateUniqueToken,
  invalidatePasswordReset,
  invalidateSession,
  tokenBucketConsume,
  validatePasswordResetToken,
} from "@webapp/auth"
import { getEnhancedPrisma } from "@webapp/orm"

export const resetPassword: FastifyPluginCallback = function (app) {
  app.post<{
    Body: { newPassword: string; confirmPassword: string; token: string }
  }>("", async function (req, rep) {
    // Get reset password token from request body
    const { token } = req.body
    // Verify password reset
    const { passwordReset, user } = await validatePasswordResetToken(token)
    // If password reset or user not present, return error
    if (!passwordReset || !user) {
      console.log("Password reset or user not found")
      return rep
        .status(401)
        .send({ error: "Unauthorized: Invalid password reset request" })
    }
    // Check user token limits
    if (!tokenBucketConsume(user.id, 1)) {
      console.log(`Not enough tokens for user id: ${req.user!.id}`)
      return rep
        .status(429)
        .send({ error: "Too many requests: Not enough tokens" })
    }
    // Get new password info from request body
    const { newPassword, confirmPassword } = req.body
    // Verify new password
    if (newPassword !== confirmPassword) {
      console.log("Resetting password faild, passwords did not match")
      return rep.status(422).send({ error: "Passwords did not match" })
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
    // Create new session
    const sessionToken = generateUniqueToken()
    const session = await createSession(sessionToken, user)
    // Set session cookie
    rep.setSessionCookie(sessionToken, session.expiresAt)
    // Success
    return rep.status(200).send()
  })
}
