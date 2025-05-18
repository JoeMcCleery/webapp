import type { EnhancementContext } from "@zenstackhq/runtime"

import { getEncryptionKey } from "./encryption"
import { PrismaClient } from "./generated/client"
import * as z from "./generated/zenstack/enhance"
import type { AuthUser } from "./types"

export const dangerousPrisma = new PrismaClient()

export const getEnhancedPrisma = (context: EnhancementContext<AuthUser> = {}) =>
  z.enhance(dangerousPrisma, context, {
    encryption: { encryptionKey: getEncryptionKey() },
  })

export const defaultPrisma = getEnhancedPrisma()
