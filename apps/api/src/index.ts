import fastifyAuth from "@fastify/auth"
import fastifyCookie from "@fastify/cookie"
import cors from "@fastify/cors"
import fastifyHelmet from "@fastify/helmet"
import fastifyMultipart from "@fastify/multipart"
import fastifySensible from "@fastify/sensible"
import Fastify from "fastify"

import { emailPlugin } from "./email"
import { middleware } from "./middleware"
import { routes } from "./routes"

const init = async function () {
  // Create fastify server
  const app = Fastify({
    logger: true,
  })

  // Register plugins
  app.register(cors, {
    origin: [
      `https://api.${process.env.DOMAIN_APP}`,
      `https://admin.${process.env.DOMAIN_APP}`,
    ],
    credentials: true,
  })
  app.register(fastifyHelmet)
  app.register(fastifyCookie, {
    parseOptions: {
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      path: "/",
      domain: process.env.DOMAIN_APP,
    },
  })
  app.register(fastifyAuth, { defaultRelation: "and" })
  app.register(fastifySensible)
  app.register(fastifyMultipart, {
    limits: {
      fileSize: 5000000,
    },
  })
  app.register(emailPlugin)

  // Register middleware
  app.register(middleware)

  // Await plugins to finish loading
  await app.after()

  // Register routes
  app.register(routes)

  // Return initialized app
  return app
}

// Init
init().then((app) => {
  // Start the server!
  app.listen({ host: "0.0.0.0", port: 3000 }, function (err, address) {
    if (err) {
      app.log.error(err)
      process.exit(1)
    }
    console.log(app.printRoutes())
  })

  // Gracefull shutdown
  const signals = ["SIGTERM", "SIGINT"]
  signals.forEach((signal) => {
    process.on(signal, () => {
      console.log("Server shutting down...")
      app.close().then(() => {
        process.exit(0)
      })
    })
  })
})
