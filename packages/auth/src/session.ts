import { getEnhancedPrisma } from "@web-app/db"
import {
  encodeBase32LowerCaseNoPadding,
  encodeHexLowerCase,
} from "@oslojs/encoding"
import { sha256 } from "@oslojs/crypto/sha2"

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
  const prisma = getEnhancedPrisma()
  const sessionId = generateSessionId(token)
  const session = await prisma.session.create({
    data: {
      id: sessionId,
      userId,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
    },
  })
  return session
}

export async function validateSessionToken(token: string) {
  const prisma = getEnhancedPrisma()
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
  if (Date.now() >= session.expiresAt.getTime()) {
    await prisma.session.delete({ where: { id: sessionId } })
    return { session: null, user: null }
  }
  if (Date.now() >= session.expiresAt.getTime() - 1000 * 60 * 60 * 24 * 15) {
    session.expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)
    await prisma.session.update({
      where: {
        id: session.id,
      },
      data: {
        expiresAt: session.expiresAt,
      },
    })
  }
  return { session, user }
}

export async function invalidateSession(sessionId: string) {
  const prisma = getEnhancedPrisma()
  await prisma.session.delete({ where: { id: sessionId } })
}

export async function invalidateAllSessions(userId: string) {
  const prisma = getEnhancedPrisma()
  await prisma.session.deleteMany({
    where: {
      userId: userId,
    },
  })
}
