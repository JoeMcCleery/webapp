import type { User } from "@webapp/orm"

export const fullName = (user?: User | null) => {
  if (!user) return ""
  if (user.familyName) {
    return `${user.givenName} ${user.familyName}`
  }
  return user.givenName
}
