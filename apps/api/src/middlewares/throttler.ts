import { FastifyAuthFunction } from "@fastify/auth"
import fp from "fastify-plugin"

import { throttlerConsume, throttlerReset } from "@web-app/auth"

declare module "fastify" {
  export interface FastifyInstance {
    throttlerConsume: FastifyAuthFunction
    throttlerReset: FastifyAuthFunction
  }
}

export const throttlerMiddleware = fp(function (app) {
  app.decorate<FastifyAuthFunction>(
    "throttlerConsume",
    async function (req, rep) {
      // Check throttle limits for request ip
      if (!throttlerConsume(req.ip)) {
        console.log(`Throttler limit exceeded for ip: ${req.ip}`)
        return rep.status(429).send({ error: "Too many requests" })
      }
    },
  )

  app.decorate<FastifyAuthFunction>(
    "throttlerReset",
    async function (req, rep) {
      // Reset throttle limits for request ip if response is successful
      if (rep.statusCode === 200 || rep.statusCode === 201) {
        console.log(`Throttler limit reset for ip: ${req.ip}`)
        throttlerReset(req.ip)
      }
    },
  )
})
