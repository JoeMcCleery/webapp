import type { FastifyAuthFunction } from "@fastify/auth"
import fp from "fastify-plugin"

import { throttlerConsume, throttlerReset } from "@webapp/auth"

declare module "fastify" {
  interface FastifyInstance {
    throttlerConsume: FastifyAuthFunction
    throttlerReset: FastifyAuthFunction
  }
}

export const throttlerMiddleware = fp(function (app) {
  app.decorate<FastifyAuthFunction>(
    "throttlerConsume",
    function (req, rep, done) {
      // Check throttle limits for request ip
      if (!throttlerConsume(req.ip)) {
        console.log(`Throttler limit exceeded for ip: ${req.ip}`)
        rep
          .status(429)
          .send({ error: "Too many requests: Throttler limit exceded" })
        // Request failed
        return done(new Error())
      }
      // Continue with request
      return done()
    },
  )

  app.decorate<FastifyAuthFunction>(
    "throttlerReset",
    function (req, rep, done) {
      // Reset throttle limits for request ip if response is successful
      if (rep.statusCode === 200 || rep.statusCode === 201) {
        console.log(`Throttler limit reset for ip: ${req.ip}`)
        throttlerReset(req.ip)
      }
      // Continue with request
      return done()
    },
  )
})
