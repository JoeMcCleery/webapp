import fastifyAuth from "@fastify/auth"
import Fastify from "fastify"

import { authMiddleware } from "./middlewares/auth"
import { throttlerMiddleware } from "./middlewares/throttler"
import { routes } from "./routes"

const init = async function () {
  // Create fastify server
  const app = Fastify({
    logger: true,
  })

  // Register middlewares
  app.register(authMiddleware)
  app.register(throttlerMiddleware)

  // Register auth plugin
  app.register(fastifyAuth, { defaultRelation: "and" })

  // Await plugins to finish loading
  await app.after()

  // Register routes
  app.register(routes)

  // Return initialized app
  return app
}

// Start the server!
init().then((app) => {
  app.listen({ host: "0.0.0.0", port: 3000 }, function (err, address) {
    if (err) {
      app.log.error(err)
      process.exit(1)
    }
    console.log(app.printRoutes())
  })
})
