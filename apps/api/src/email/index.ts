import fp from "fastify-plugin"

import { transporter } from "./nodemailer"
import { render } from "./nunjucks"

export * from "./nodemailer"
export * from "./nunjucks"

declare module "fastify" {
  interface FastifyInstance {
    mail: typeof mail
  }
}

const mail = {
  async sendOtpEmail(email: string, otpCode: string) {
    const html = render("otp.njk", { otpCode })
    return await transporter.sendMail({
      to: email,
      subject: "Your Password Reset Code",
      html,
    })
  },
}

export const emailPlugin = fp((app) => {
  app.decorate("mail", mail)
})
