import { initTRPC } from "@trpc/server"

import { getEnhancedPrisma } from "./client"
import { createRouter } from "./generated/trpc/routers"

export type Context = {
  prisma: ReturnType<typeof getEnhancedPrisma>
}

const t = initTRPC.context<Context>().create()

export const createTRPCRouter = t.router
export const procedure = t.procedure

export const appRouter = createRouter()
export type AppRouter = typeof appRouter
