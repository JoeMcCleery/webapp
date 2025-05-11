import type { EnhancementContext } from "@zenstackhq/runtime"

import { getEncryptionKey } from "./encryption"
import { PrismaClient } from "./generated/client"
import { enhance } from "./generated/zenstack/enhance"
import { AuthUser } from "./types"

export const dangerousPrisma = new PrismaClient()

export const getEnhancedPrisma = (context: EnhancementContext<AuthUser> = {}) =>
  enhance(dangerousPrisma, context, {
    encryption: { encryptionKey: getEncryptionKey() },
  })

export const defaultPrisma = getEnhancedPrisma()
