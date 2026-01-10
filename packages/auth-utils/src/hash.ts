import { sha3_256 } from "@oslojs/crypto/sha3"
import { encodeHexLowerCase } from "@oslojs/encoding"
import * as argon2 from "argon2"
import * as crypto from "crypto"

export type HashOptions = {
  secret?: string
  lowercase?: boolean
}

const defaultOptions: HashOptions = {
  secret: "",
  lowercase: false,
}

function generateSalt() {
  return encodeHexLowerCase(crypto.randomBytes(16))
}

export function generateFastHash(value: string, options: HashOptions = {}) {
  options = { ...defaultOptions, ...options }
  if (options.lowercase) {
    value = value.toLowerCase()
  }
  const salt = generateSalt()
  return `${salt}:${encodeHexLowerCase(
    sha3_256(new TextEncoder().encode(value + salt + options.secret)),
  )}`
}

export async function generateSlowHash(
  value: string,
  options: HashOptions = {},
) {
  options = { ...defaultOptions, ...options }
  if (options.lowercase) {
    value = value.toLowerCase()
  }
  return await argon2.hash(value, {
    secret: Buffer.from(options.secret!),
  })
}

export async function verifySlowHash(
  hash: string,
  value: string,
  options: HashOptions = {},
) {
  options = { ...defaultOptions, ...options }
  if (options.lowercase) {
    value = value.toLowerCase()
  }
  return await argon2.verify(hash, value, {
    secret: Buffer.from(options.secret!),
  })
}
