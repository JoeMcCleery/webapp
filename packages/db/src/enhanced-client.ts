import { EnhancementContext, EnhancementOptions } from "@zenstackhq/runtime"

import { PrismaClient, User } from "./generated/client"
import { enhance } from "./generated/zenstack/enhance"

const prisma = new PrismaClient()

const getEnhancedPrisma = (
  context?: EnhancementContext<User>,
  options?: EnhancementOptions,
) => enhance(prisma, context, options)

export { getEnhancedPrisma }
