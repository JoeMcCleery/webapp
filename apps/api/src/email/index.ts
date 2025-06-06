import type { FastifyInstance } from "fastify"
import fp from "fastify-plugin"
import Mail from "nodemailer/lib/mailer"

import { sendMail } from "./nodemailer"
import { render } from "./nunjucks"

export * from "./nodemailer"
export * from "./nunjucks"

declare module "fastify" {
  interface FastifyInstance {
    sendMail: typeof sendMail
    renderView: typeof render
  }
}

export const emailPlugin = fp((app) => {
  app.decorate(
    "sendMail",
    async function (this: FastifyInstance, options: Mail.Options) {
      return await sendMail(options)
    },
  )

  app.decorate(
    "renderView",
    async function (this: FastifyInstance, name: string, context?: object) {
      return render(name, context)
    },
  )
})
