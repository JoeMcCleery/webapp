import {
  auth,
  EnhancementContext,
  EnhancementOptions,
} from "@zenstackhq/runtime"
import { PrismaClient } from "./generated/client"
import { enhance } from "./generated/zenstack/enhance"

const prisma = new PrismaClient()

const getEnhancedPrisma = (
  context?: EnhancementContext<auth.User>,
  options?: EnhancementOptions
) => enhance(prisma, context, options)

export { getEnhancedPrisma }
