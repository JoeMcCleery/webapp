import { EnhancementContext, EnhancementOptions } from "@zenstackhq/runtime"

import { PrismaClient, User } from "./generated/client"
import { enhance } from "./generated/zenstack/enhance"

export const prisma = new PrismaClient()

export const getEnhancedPrisma = (
  context?: EnhancementContext<User>,
  options?: EnhancementOptions,
) => enhance(prisma, context, options)
