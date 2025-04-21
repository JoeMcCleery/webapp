import { dangerousPrisma, getEnhancedPrisma, User } from "@web-app/orm"

import { generateHashFromToken } from "./token-generator"

const passwordResetDuration = 1000 * 60 * 15 // 15 minutes

export async function createPasswordReset(token: string, email: string) {
  // Find user using email
  const user = await dangerousPrisma.user.findUnique({
    where: {
      email,
    },
  })
  // If no user found return null
  if (!user) {
    return null
  }
  // Invalidate existing password reset
  await invalidatePasswordReset(user)
  // Create a new password reset
  const tokenHash = generateHashFromToken(token)
  const prisma = getEnhancedPrisma({ user })
  const passwordReset = await prisma.passwordReset.create({
    data: {
      tokenHash,
      expiresAt: new Date(Date.now() + passwordResetDuration),
    },
  })
  // Return new password reset
  return passwordReset
}

export async function validatePasswordResetToken(token: string) {
  // Check if password reset exists
  const tokenHash = generateHashFromToken(token)
  const result = await dangerousPrisma.passwordReset.findUnique({
    where: {
      tokenHash,
    },
    include: {
      user: true,
    },
  })
  if (!result) {
    return { passwordReset: null, user: null }
  }
  // Check user and password reset exist
  const { user, ...passwordReset } = result
  if (!user || !passwordReset) {
    return { passwordReset: null, user: null }
  }
  // Check if password reset is expired
  if (Date.now() >= passwordReset.expiresAt.getTime()) {
    // Invalidate expired password reset
    await invalidatePasswordReset(user)
    return { passwordReset: null, user: null }
  }
  // Return password reset and user
  return { passwordReset, user }
}

export async function invalidatePasswordReset(user: User) {
  // Invalidate password reset by deleting it from the database
  const prisma = getEnhancedPrisma({ user })
  // NOTE: "deleteMany" wont throw if there is no existing password reset
  await prisma.passwordReset.deleteMany({ where: { userId: user.id } })
}
