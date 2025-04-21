import { FastifyPluginCallback } from "fastify"

import { createSession, generateUniqueToken } from "@web-app/auth"
import { dangerousPrisma, defaultPrisma, Prisma, User } from "@web-app/orm"

export const signup: FastifyPluginCallback = function (app) {
  app.post<{ Body: { name: string; email: string; password: string } }>(
    "",
    async function (req, rep) {
      // Get user info from request body
      const { name, email, password } = req.body
      // Create new user
      let user: User | null = null
      try {
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
        return rep.status(422).send({ error: "Invalid signup request" })
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
