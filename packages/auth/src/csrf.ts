import { hmac } from "@oslojs/crypto/hmac"
import { SHA3_256 } from "@oslojs/crypto/sha3"
import { constantTimeEqual } from "@oslojs/crypto/subtle"
import { decodeHex, encodeHexLowerCase } from "@oslojs/encoding"

import { generateUniqueToken } from "@webapp/auth-utils"

function createHMAC(sessionId: string, randomToken: string) {
  const textEncoder = new TextEncoder()
  const secret = textEncoder.encode(process.env.CSRF_SECRET)
  const message = textEncoder.encode(
    `${sessionId.length}!${sessionId}!${randomToken.length}!${randomToken}`,
  )
  return hmac(SHA3_256, secret, message)
}

export function createCSRFToken(sessionId: string) {
  const randomToken = generateUniqueToken()
  const newHMAC = createHMAC(sessionId, randomToken)
  return `${encodeHexLowerCase(newHMAC)}.${randomToken}`
}

export function validateCSRFToken(sessionId: string, csrfToken: string) {
  const csrfParts = csrfToken.split(".")
  const hmacFromCSRF = decodeHex(csrfParts[0])
  const randomToken = csrfParts[1]
  const expectedHMAC = createHMAC(sessionId, randomToken)
  return constantTimeEqual(expectedHMAC, hmacFromCSRF)
}
