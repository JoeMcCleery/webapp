import { customType } from "drizzle-orm/pg-core"

import { generateFastHash } from "@webapp/auth-utils"
import type { HashOptions } from "@webapp/auth-utils"

export const hashedText = (options: HashOptions = {}) =>
  customType<{ data: string }>({
    dataType() {
      return "text"
    },
    toDriver(value: string) {
      return generateFastHash(value, options)
    },
  })()
