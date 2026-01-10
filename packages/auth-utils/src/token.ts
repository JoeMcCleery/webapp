import { encodeBase32LowerCaseNoPadding } from "@oslojs/encoding"
import * as crypto from "crypto"

export function generateUniqueToken() {
  return encodeBase32LowerCaseNoPadding(crypto.randomBytes(20))
}
