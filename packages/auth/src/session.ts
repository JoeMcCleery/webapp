import { sha256 } from "@oslojs/crypto/sha2"
import {
  encodeBase32LowerCaseNoPadding,
  encodeHexLowerCase,
} from "@oslojs/encoding"

import { prisma } from "@web-app/db"

const sessionDuration = 1000 * 60 * 60 * 24 * 30 // 30 days
const sessionRefreshThreshold = 1000 * 60 * 60 * 24 * 15 // 15 days

export function generateSessionToken() {
  const bytes = new Uint8Array(20)
  crypto.getRandomValues(bytes)
  const token = encodeBase32LowerCaseNoPadding(bytes)
  return token
}

function generateSessionId(token: string) {
  return encodeHexLowerCase(sha256(new TextEncoder().encode(token)))
}

export async function createSession(token: string, userId: string) {
  // Create a new session
  const sessionId = generateSessionId(token)
  const session = await prisma.session.create({
    data: {
      id: sessionId,
      userId,
      expiresAt: new Date(Date.now() + sessionDuration),
    },
  })
  return session
}

export async function validateSessionToken(token: string) {
  // Check if session exists
  const sessionId = generateSessionId(token)
  const result = await prisma.session.findUnique({
    where: {
      id: sessionId,
    },
    include: {
      user: true,
    },
  })
  if (result === null) {
    return { session: null, user: null }
  }
  const { user, ...session } = result
  // Check if session is expired
  if (Date.now() >= session.expiresAt.getTime()) {
    await invalidateSession(sessionId)
    return { session: null, user: null }
  }
  // Refresh session expiration date if it is within 15 days of expiration
  if (Date.now() >= session.expiresAt.getTime() - sessionRefreshThreshold) {
    session.expiresAt = new Date(Date.now() + sessionDuration)
    await prisma.session.update({
      where: {
        id: session.id,
      },
      data: {
        expiresAt: session.expiresAt,
      },
    })
  }
  // Return session and user
  return { session, user }
}

export async function invalidateSession(sessionId: string) {
  // Invalidate session by deleting it from the database
  await prisma.session.delete({ where: { id: sessionId } })
}

export async function invalidateAllSessions(userId: string) {
  // Invalidate all sessions for a user by deleting them from the database
  await prisma.session.deleteMany({
    where: {
      userId: userId,
    },
  })
}
