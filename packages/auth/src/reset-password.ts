import { dangerousPrisma, getEnhancedPrisma } from "@webapp/orm"
import type { AuthUser } from "@webapp/orm"

import { generateHash, generateUniqueToken } from "./token-generator"

const passwordResetDuration = 1000 * 60 * 15 // 15 minutes

export async function createPasswordReset(
  otpCode: string,
  token: string,
  email: string,
) {
  // Get email hash
  const emailHash = generateHash(email, {
    salt: process.env.DB_EMAIL_SALT,
    lowercase: true,
  })
  // Find user using email hash
  const user = await dangerousPrisma.user.findUnique({
    where: {
      emailHash,
    },
    include: {
      userRoles: { include: { permissions: true } },
    },
  })
  // If no user found return null
  if (!user) {
    return null
  }
  // Invalidate existing password reset
  await invalidatePasswordReset(user)
  // Create a new password reset
  const tokenHash = generateHash(token)
  const otpCodeHash = generateHash(otpCode)
  const prisma = getEnhancedPrisma({ user })
  const passwordReset = await prisma.passwordReset.create({
    data: {
      otpCodeHash,
      tokenHash,
      expiresAt: new Date(Date.now() + passwordResetDuration),
    },
  })
  // Return new password reset
  return passwordReset
}

export async function confirmOTPCode(otpCode: string, token: string) {
  // Check if password reset exists
  const tokenHash = generateHash(token)
  const otpCodeHash = generateHash(otpCode)
  const result = await dangerousPrisma.passwordReset.findUnique({
    where: {
      otpCodeHash,
      tokenHash,
    },
    include: {
      user: { include: { userRoles: { include: { permissions: true } } } },
    },
  })
  if (!result) {
    return { passwordReset: null, user: null, otpToken: null }
  }
  // Check user and password reset exist
  const { user, ...passwordReset } = result
  if (!user || !passwordReset) {
    return { passwordReset: null, user: null, otpToken: null }
  }
  // Check if password reset has expired
  if (Date.now() >= passwordReset.expiresAt.getTime()) {
    // Invalidate expired password reset
    await invalidatePasswordReset(user)
    return { passwordReset: null, user: null, otpToken: null }
  }
  // Create OTP token
  const otpToken = generateUniqueToken()
  const otpTokenHash = generateHash(otpToken)
  // Update password reset with new OTP token, and invalidate used OTP code
  const prisma = getEnhancedPrisma({ user })
  const updatedPasswordReset = await prisma.passwordReset.update({
    where: { id: passwordReset.id },
    data: { otpTokenHash, otpCodeHash: null },
  })
  // Return password reset, user and otp token
  return { passwordReset: updatedPasswordReset, user, otpToken }
}

export async function validatePasswordReset(token: string, otpToken: string) {
  // Check if password reset exists
  const tokenHash = generateHash(token)
  const otpTokenHash = generateHash(otpToken)
  const result = await dangerousPrisma.passwordReset.findUnique({
    where: {
      otpTokenHash,
      tokenHash,
    },
    include: {
      user: { include: { userRoles: { include: { permissions: true } } } },
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
  // Check if password reset has expired
  if (Date.now() >= passwordReset.expiresAt.getTime()) {
    // Invalidate expired password reset
    await invalidatePasswordReset(user)
    return { passwordReset: null, user: null }
  }
  // Return password reset and user
  return { passwordReset, user }
}

export async function invalidatePasswordReset(user: AuthUser) {
  // Invalidate password reset by deleting it from the database
  const prisma = getEnhancedPrisma({ user })
  // NOTE: "deleteMany" wont throw if there is no existing password reset
  await prisma.passwordReset.deleteMany({ where: { userId: user.id } })
}
