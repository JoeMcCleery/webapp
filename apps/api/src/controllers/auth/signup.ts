import type { FastifyPluginCallback } from "fastify"

import { generateHash, invalidateSession } from "@webapp/auth"
import { dangerousPrisma, defaultPrisma, Prisma } from "@webapp/orm"
import type { AuthUser } from "@webapp/orm"

export const signup: FastifyPluginCallback = function (app) {
  app.post<{
    Body: {
      givenName: string
      familyName?: string
      email: string
      password: string
    }
  }>("", async function (req, rep) {
    // Get user info from request body
    const { givenName, familyName, email, password } = req.body
    // Get email hash
    const emailHash = generateHash(email, {
      salt: process.env.DB_EMAIL_SALT,
      lowercase: true,
    })
    // Create new user
    let user: AuthUser | null = null
    try {
      // Safely create new user
      await defaultPrisma.user.create({
        data: {
          givenName,
          familyName,
          email: email.toLowerCase(),
          emailHash,
          password,
        },
      })
    } catch (e) {
      // Catch "result is not allowed to be read back" error then try get created user using dangerous prisma client
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        // https://www.prisma.io/docs/orm/reference/error-reference#p2004
        if (e.code === "P2004") {
          // Find user with email hash
          user = await dangerousPrisma.user.findUnique({
            where: {
              emailHash,
            },
            include: {
              userRoles: { include: { permissions: true } },
              userModelPermissions: true,
            },
          })
        }
      }
    }
    // Check if user was created
    if (!user) {
      console.log("Could not create a new user")
      return rep.unprocessableEntity("Invalid signup request")
    }
    // Invalidate existing session
    if (req.user && req.session) {
      await invalidateSession(req.user, req.session.id)
    }
    // Create new user session
    const csrfToken = await rep.createUserSession(user)
    // Success
    return rep.status(200).send(csrfToken)
  })
}
