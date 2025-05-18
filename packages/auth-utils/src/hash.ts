import { sha256 } from "@oslojs/crypto/sha2"
import { encodeHexLowerCase } from "@oslojs/encoding"

type HashOptions = {
  salt?: string
  lowercase?: boolean
}

const defaultHashOptions: HashOptions = {
  salt: "",
  lowercase: false,
}

export function generateHash(value: string, options: HashOptions = {}) {
  options = { ...defaultHashOptions, ...options }
  if (options.lowercase) {
    value = value.toLowerCase()
  }
  return encodeHexLowerCase(
    sha256(new TextEncoder().encode(value + options.salt)),
  )
}
