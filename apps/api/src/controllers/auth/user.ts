import type { FastifyPluginCallback } from "fastify"

import { getEnhancedPrisma } from "@webapp/orm"

export const user: FastifyPluginCallback = function (app) {
  app.post("", async function (req, rep) {
    // Check user exists
    if (req.user) {
      // Get safe user
      const prisma = getEnhancedPrisma({ user: req.user })
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        include: { userRoles: { include: { permissions: true } } },
      })
      // Send user object back to client
      console.log("Send authenticated user object to client")
      return rep.status(200).send(user)
    }
    console.log("No authenticated user, sending null user to client")
    return rep.status(200).send(null)
  })
}
