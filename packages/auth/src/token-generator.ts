import { generateRandomString } from "@oslojs/crypto/random"
import type { RandomReader } from "@oslojs/crypto/random"
import { sha256 } from "@oslojs/crypto/sha2"
import {
  encodeBase32LowerCaseNoPadding,
  encodeHexLowerCase,
} from "@oslojs/encoding"

export function generateUniqueToken() {
  const bytes = new Uint8Array(20)
  crypto.getRandomValues(bytes)
  const token = encodeBase32LowerCaseNoPadding(bytes)
  return token
}

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

const random: RandomReader = {
  read(bytes) {
    crypto.getRandomValues(bytes)
  },
}
const otpAlphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
export function generateOTPCode(length: number) {
  return generateRandomString(random, otpAlphabet, length)
}
