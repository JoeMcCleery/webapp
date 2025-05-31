import type { FastifyPluginCallback } from "fastify"

import { image } from "../controllers/upload"

export const upload: FastifyPluginCallback = function (app) {
  app.register(image, { prefix: "/image" })
}
