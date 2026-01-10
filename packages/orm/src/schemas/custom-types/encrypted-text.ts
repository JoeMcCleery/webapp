import { customType } from "drizzle-orm/pg-core"

import { decryptText, encryptText } from "@webapp/auth-utils"
import type { EncryptionOptions } from "@webapp/auth-utils"

export const encryptedText = (options: EncryptionOptions = {}) =>
  customType<{ data: string; driverData: string }>({
    dataType() {
      return "text"
    },
    fromDriver(value: string) {
      return decryptText(value, options)
    },
    toDriver(value: string) {
      return encryptText(value, options)
    },
  })()
