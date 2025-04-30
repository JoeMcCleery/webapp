import type { FastifyPluginCallback } from "fastify"

import { invalidateSession } from "@webapp/auth"
import { dangerousPrisma, defaultPrisma, Prisma } from "@webapp/orm"
import type { User } from "@webapp/orm"

export const signup: FastifyPluginCallback = function (app) {
  app.post<{ Body: { name: string; email: string; password: string } }>(
    "",
    async function (req, rep) {
      // Get user info from request body
      const { name, email, password } = req.body
      // Create new user
      let user: User | null = null
      try {
        // Safely create new user
        await defaultPrisma.user.create({
          data: { name, email, password },
        })
      } catch (e) {
        // Catch "result is not allowed to be read back" error then try get created user using dangerous prisma client
        if (e instanceof Prisma.PrismaClientKnownRequestError) {
          // https://www.prisma.io/docs/orm/reference/error-reference#p2004
          if (e.code === "P2004") {
            user = await dangerousPrisma.user.findUnique({
              where: {
                email,
              },
            })
          }
        }
      }
      // Check if user was created
      if (!user) {
        console.log("Could not create a new user")
        return rep
          .status(422)
          .send({ error: "Unprocessable Content: Invalid signup request" })
      }
      // Invalidate existing session
      if (req.user && req.session) {
        await invalidateSession(req.user, req.session.id)
      }
      // Create new user session
      await rep.createUserSession(user)
      // Success
      return rep.status(200).send()
    },
  )
}
