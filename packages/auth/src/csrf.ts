import { hmac } from "@oslojs/crypto/hmac"
import { SHA256 } from "@oslojs/crypto/sha2"
import { constantTimeEqual } from "@oslojs/crypto/subtle"
import { decodeHex, encodeHexLowerCase } from "@oslojs/encoding"

import { generateUniqueToken } from "./token-generator"

export function createCSRFToken(sessionId: string) {
  const randomToken = generateUniqueToken()
  const newHMAC = createHMAC(sessionId, randomToken)
  return `${encodeHexLowerCase(newHMAC)}.${randomToken}`
}

function createHMAC(sessionId: string, randomToken: string) {
  const textEncoder = new TextEncoder()
  const secret = textEncoder.encode(process.env.CSRF_SECRET)
  const message = textEncoder.encode(
    `${sessionId.length}!${sessionId}!${randomToken.length}!${randomToken}`,
  )
  return hmac(SHA256, secret, message)
}

export function validateCSRF(sessionId: string, csrfToken: string) {
  const csrfParts = csrfToken.split(".")
  const hmacFromCSRF = decodeHex(csrfParts[0])
  const randomToken = csrfParts[0]
  const expectedHMAC = createHMAC(sessionId, randomToken)
  return constantTimeEqual(expectedHMAC, hmacFromCSRF)
}
