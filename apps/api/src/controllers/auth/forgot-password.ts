import type { FastifyPluginCallback } from "fastify"

import {
  createPasswordReset,
  generateOTPCode,
  generateUniqueToken,
} from "@webapp/auth"

export const forgotPassword: FastifyPluginCallback = function (app) {
  app.post<{
    Body: { email: string }
  }>("", async function (req, rep) {
    // Get email from request body
    const { email } = req.body
    // Create new password reset
    const token = generateUniqueToken()
    const otpCode = generateOTPCode(6)
    const passwordReset = await createPasswordReset(otpCode, token, email)
    // Send email to user with new password reset link
    if (passwordReset) {
      console.log(`Sending new password reset otp to user`)
      if (process.env.NODE_ENV === "development") {
        console.log(`OTP CODE: ${otpCode}`)
      }
      // TODO send email with password reset otp
    } else {
      console.log("Failed to create new password reset")
    }
    // Always success as to not disclose account existance
    return rep.status(200).send(token)
  })
}
