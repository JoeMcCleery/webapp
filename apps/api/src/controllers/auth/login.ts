import { FastifyPluginCallback } from "fastify"

import {
  createSession,
  generateSessionToken,
  tokenBucketConsume,
} from "@web-app/auth"
import { getEnhancedPrisma } from "@web-app/db"

export const login: FastifyPluginCallback = function (app) {
  app.post("/", async function (req, rep) {
    // Get user credentials from request body
    const { email, password } = req.body as {
      email: string
      password: string
    }
    // Find user
    const prisma = getEnhancedPrisma()
    const user = await prisma.user.findUnique({
      where: {
        email,
        password,
      },
    })
    // Check if user exists
    if (!user) {
      console.log("User not found")
      return rep.status(401).send({ error: "Invalid email or password" })
    }
    // Check user token limits
    if (!tokenBucketConsume(user.id, 1)) {
      console.log("Token bucket limit exceeded")
      return rep.status(429).send({ error: "Too many requests" })
    }
    // Create new session
    const token = generateSessionToken()
    const session = await createSession(token, user.id)
    // Set session cookie
  })
}
