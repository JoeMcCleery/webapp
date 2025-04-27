import { dangerousPrisma, getEnhancedPrisma, Session, User } from "@webapp/orm"

import { generateHashFromToken } from "./token-generator"

const sessionDuration = 1000 * 60 * 60 * 24 * 30 // 30 days
const sessionRefreshThreshold = 1000 * 60 * 60 * 24 * 15 // 15 days

export async function createSession(token: string, user: User) {
  // Create a new session for user
  const tokenHash = generateHashFromToken(token)
  const prisma = getEnhancedPrisma({ user })
  const session = await prisma.session.create({
    data: {
      tokenHash,
      expiresAt: new Date(Date.now() + sessionDuration),
    },
  })
  // Return new session
  return session
}

export async function validateSessionToken(token: string) {
  // Check if session exists
  const tokenHash = generateHashFromToken(token)
  const result = await dangerousPrisma.session.findUnique({
    where: {
      tokenHash,
    },
    include: {
      user: true,
    },
  })
  if (!result) {
    return { session: null, user: null }
  }
  // Check session and user exist
  const { user, ...session } = result
  if (!user || !session) {
    return { session: null, user: null }
  }
  // Check if session is expired
  if (Date.now() >= session.expiresAt.getTime()) {
    // Invalidate expired session
    await invalidateSession(user, session.id)
    return { session: null, user: null }
  }
  // Refresh session expiration date if it is within 15 days of expiration
  if (Date.now() >= session.expiresAt.getTime() - sessionRefreshThreshold) {
    await refreshSessionExpiry(user, session)
  }
  // Return session and user
  return { session, user }
}

export async function refreshSessionExpiry(user: User, session: Session) {
  // Session will expire after session duration time
  session.expiresAt = new Date(Date.now() + sessionDuration)
  const prisma = getEnhancedPrisma({ user })
  await prisma.session.update({
    where: {
      id: session.id,
    },
    data: {
      expiresAt: session.expiresAt,
    },
  })
}

export async function invalidateSession(user: User, sessionId: string) {
  // Invalidate session by deleting it from the database
  const prisma = getEnhancedPrisma({ user })
  await prisma.session.delete({ where: { id: sessionId } })
}

export async function invalidateAllSessions(user: User) {
  // Invalidate all sessions for a user by deleting them from the database
  const prisma = getEnhancedPrisma({ user })
  await prisma.session.deleteMany({
    where: {
      userId: user.id,
    },
  })
}
