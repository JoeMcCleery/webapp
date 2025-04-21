import { FastifyPluginCallback } from "fastify"

import {
  createPasswordReset,
  generateUniqueToken,
  invalidatePasswordReset,
  tokenBucketConsume,
  validatePasswordResetToken,
} from "@web-app/auth"
import { getEnhancedPrisma } from "@web-app/orm"

export const forgotPassword: FastifyPluginCallback = function (app) {
  app.post<{
    Body: { email: string }
  }>("", async function (req, rep) {
    // Get email from request body
    const { email } = req.body
    // Create new password reset
    const token = generateUniqueToken()
    const passwordReset = await createPasswordReset(token, email)
    // Send email to user with new password reset link
    if (passwordReset) {
      console.log(`Sending new password reset token: ${token}`)
      // TODO
    } else {
      console.log("Failed to create new password reset")
    }
    // Always success as to not disclose account existance
    return rep.status(200).send()
  })
}

export const resetPassword: FastifyPluginCallback = function (app) {
  app.post<{
    Params: { token: string }
    Body: { newPassword: string; confirmPassword: string }
  }>("/:token", async function (req, rep) {
    // Get reset password token from request params
    const { token } = req.params
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
    // Set new user password
    const enhancedPrisma = getEnhancedPrisma({ user })
    await enhancedPrisma.user.update({
      where: { id: user.id },
      data: { password: newPassword },
    })
    // Invalidate password reset
    await invalidatePasswordReset(user)
    // Success
    return rep.status(200).send()
  })
}
