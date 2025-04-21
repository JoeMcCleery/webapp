import { compare } from "bcryptjs"
import { FastifyPluginCallback } from "fastify"

import {
  createSession,
  generateUniqueToken,
  tokenBucketConsume,
} from "@web-app/auth"
import { dangerousPrisma } from "@web-app/orm"

export const login: FastifyPluginCallback = function (app) {
  app.post<{ Body: { email: string; password: string } }>(
    "",
    async function (req, rep) {
      // Get user credentials from request body
      const { email, password } = req.body
      // Find user using email
      const user = await dangerousPrisma.user.findUnique({
        where: {
          email,
        },
      })
      // Check if user exists
      if (!user) {
        console.log(`Couldn't login, couldn't find user with email: ${email}`)
        return rep.status(401).send({ error: "Invalid email or password" })
      }
      // Compare password with stored password hash
      const passwordMatch = await compare(password, user.password)
      if (!passwordMatch) {
        console.log("Couldn't login, provided password isn't a match")
        return rep.status(401).send({ error: "Invalid email or password" })
      }
      // Check user token limits
      if (!tokenBucketConsume(user.id, 1)) {
        console.log(`Not enough tokens for user id: ${user.id}`)
        return rep
          .status(429)
          .send({ error: "Too many requests: Not enough tokens" })
      }
      // Create new session
      const token = generateUniqueToken()
      const session = await createSession(token, user)
      // Set session cookie
      // TODO

      // Success
      return rep.status(200).send()
    },
  )
}
