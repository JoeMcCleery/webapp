import { fastifyTRPCPlugin } from "@trpc/server/adapters/fastify"
import type {
  CreateFastifyContextOptions,
  FastifyTRPCPluginOptions,
} from "@trpc/server/adapters/fastify"
import type { FastifyPluginCallback } from "fastify"

import { appRouter, getEnhancedPrisma } from "@webapp/orm"
import type { AppRouter } from "@webapp/orm"

const createContext = async ({ req, res }: CreateFastifyContextOptions) => {
  return {
    prisma: getEnhancedPrisma({ user: req.user }),
  }
}

export const trpc: FastifyPluginCallback = function (app) {
  app.register(fastifyTRPCPlugin, {
    prefix: "",
    trpcOptions: {
      router: appRouter,
      createContext,
      onError({ path, error }) {
        console.error(`Error in tRPC handler on path '${path}':`, error)
      },
    } satisfies FastifyTRPCPluginOptions<AppRouter>["trpcOptions"],
  })
}
