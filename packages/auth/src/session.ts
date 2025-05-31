import { generateHash } from "@webapp/auth-utils"
import { dangerousPrisma, getEnhancedPrisma } from "@webapp/orm"
import type { AuthUser, Session } from "@webapp/orm"

const sessionDuration = 1000 * 60 * 60 * 24 * 30 // 30 days
const sessionRefreshThreshold = 1000 * 60 * 60 * 24 * 15 // 15 days
const tempSessionDuration = 1000 * 60 * 60 * 24 * 2 // 2 days
const tempSessionRefreshThreshold = 1000 * 60 * 60 * 24 * 1 // 1 days

export async function createSession(
  token: string,
  user: AuthUser,
  persist: boolean,
) {
  // Create a new session for user
  const tokenHash = generateHash(token)
  const prisma = getEnhancedPrisma({ user })
  const session = await prisma.session.create({
    data: {
      tokenHash,
      persist,
      expiresAt: new Date(
        Date.now() + (persist ? sessionDuration : tempSessionDuration),
      ),
    },
  })
  // Return new session
  return session
}

export async function validateSessionToken(token: string) {
  // Check if session exists
  const tokenHash = generateHash(token)
  const result = await dangerousPrisma.session.findUnique({
    where: {
      tokenHash,
    },
    include: {
      user: {
        include: {
          userRoles: { include: { permissions: true } },
          modelPermissions: true,
        },
      },
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
  // Check if session has expired
  if (Date.now() >= session.expiresAt.getTime()) {
    // Invalidate expired session
    await invalidateSession(user, session.id)
    return { session: null, user: null }
  }
  // Refresh session expiration date if it is within refresh threshold
  if (
    Date.now() >=
    session.expiresAt.getTime() -
      (session.persist ? sessionRefreshThreshold : tempSessionRefreshThreshold)
  ) {
    await refreshSessionExpiry(user, session)
  }
  // Return session and user
  return { session, user }
}

export async function refreshSessionExpiry(user: AuthUser, session: Session) {
  // Session will expire after session duration time
  session.expiresAt = new Date(
    Date.now() + (session.persist ? sessionDuration : tempSessionDuration),
  )
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

export async function invalidateSession(user: AuthUser, sessionId: string) {
  // Invalidate session by deleting it from the database
  const prisma = getEnhancedPrisma({ user })
  await prisma.session.delete({ where: { id: sessionId } })
}

export async function invalidateAllSessions(user: AuthUser) {
  // Invalidate all sessions for a user by deleting them from the database
  const prisma = getEnhancedPrisma({ user })
  await prisma.session.deleteMany({
    where: {
      userId: user.id,
    },
  })
}
