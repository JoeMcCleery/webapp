import type { FastifyPluginCallback } from "fastify"

import { confirmOTPCode, tokenBucketConsume } from "@webapp/auth"

export const confirmOTP: FastifyPluginCallback = function (app) {
  app.post<{
    Body: {
      otpCode: string
      token: string
    }
  }>("", async function (req, rep) {
    // Get reset password token from request body
    const { otpCode, token } = req.body
    // Confirm otp token
    const { passwordReset, user, otpToken } = await confirmOTPCode(
      otpCode,
      token,
    )
    // If password reset or user not present, return error
    if (!passwordReset || !user || !otpToken) {
      console.log("Password reset or user not found")
      return rep.unauthorized("Invalid OTP code")
    }
    // Check user token limits
    if (!tokenBucketConsume(user.id, 1)) {
      console.log(`Not enough tokens for user id: ${req.user!.id}`)
      return rep.tooManyRequests("Not enough tokens")
    }
    // Success
    return rep.status(200).send(otpToken)
  })
}
