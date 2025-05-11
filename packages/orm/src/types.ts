import { Prisma } from "./generated/client"

const authUser = Prisma.validator<Prisma.UserDefaultArgs>()({
  include: {
    userRoles: {
      include: { permissions: true },
    },
  },
  omit: {
    password: true,
    emailHash: true,
  },
})

export type AuthUser = Prisma.UserGetPayload<typeof authUser>
