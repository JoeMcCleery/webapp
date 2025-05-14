import { compare } from "bcryptjs"
import type { FastifyPluginCallback } from "fastify"

import {
  generateHash,
  invalidateSession,
  tokenBucketConsume,
} from "@webapp/auth"
import { dangerousPrisma } from "@webapp/orm"

export const login: FastifyPluginCallback = function (app) {
  app.post<{ Body: { email: string; password: string } }>(
    "",
    async function (req, rep) {
      // Get user credentials from request body
      const { email, password } = req.body
      // Get email hash
      const emailHash = generateHash(email, {
        salt: process.env.DB_EMAIL_SALT,
        lowercase: true,
      })
      // Find user using email hash
      const user = await dangerousPrisma.user.findUnique({
        where: {
          emailHash,
        },
        include: {
          userRoles: { include: { permissions: true } },
          userModelPermissions: true,
        },
      })
      // Check if user exists
      if (!user) {
        console.log(`Couldn't login, couldn't find user with email: ${email}`)
        return rep.unauthorized("Invalid email or password")
      }
      // Compare password with stored password hash
      const passwordMatch = await compare(password, user.password)
      if (!passwordMatch) {
        console.log("Couldn't login, provided password isn't a match")
        return rep.unauthorized("Invalid email or password")
      }
      // Check user token limits
      if (!tokenBucketConsume(user.id, 1)) {
        console.log(`Not enough tokens for user id: ${user.id}`)
        return rep.tooManyRequests("Not enough tokens")
      }
      // Invalidate existing session
      if (req.user && req.session) {
        await invalidateSession(req.user, req.session.id)
      }
      // Create new user session
      const csrfToken = await rep.createUserSession(user)
      // Success
      return rep.status(200).send(csrfToken)
    },
  )
}
