import { FastifyPluginCallback } from "fastify"

import { createSession, generateSessionToken } from "@web-app/auth"
import { prisma, User } from "@web-app/db"

export const signup: FastifyPluginCallback = function (app) {
  app.post("", async function (req, rep) {
    // Get user info from request body
    const { name, email, password } = req.body as Partial<User>
    // Create new user
    const user = await prisma.user.create({ data: { name, email, password } })
    // Check if user was created
    if (!user) {
      console.log("Could not create a new user")
      return rep.status(422).send({ error: "Invalid signup request" })
    }
    // Create new session
    const token = generateSessionToken()
    const session = await createSession(token, user.id)
    // Set session cookie

    // Send user object back to client
    return rep.status(200).send({ user })
  })
}
