import { generateHash } from "@webapp/auth-utils"

import { dangerousPrisma, defaultPrisma } from "../client"
import { Prisma } from "../generated/client"

async function main() {
  // Create default admin role
  const adminRole = await dangerousPrisma.userRole.create({
    data: {
      name: "Admin",
      permissions: {
        create: [
          {
            accessAreas: ["all"],
            operations: ["create", "read", "update", "delete"],
          },
        ],
      },
    },
    include: {
      permissions: true,
    },
  })
  console.log("Created default admin role:", adminRole)

  // Create default admin user
  const adminEmail = process.env.DEFAULT_ADMIN_EMAIL || "admin@app.dev"
  const emailHash = generateHash(adminEmail, {
    salt: process.env.DB_EMAIL_SALT,
    lowercase: true,
  })
  const { permissions, ...role } = adminRole
  try {
    await defaultPrisma.user.create({
      data: {
        email: adminEmail,
        emailHash,
        givenName: "Admin",
        password: process.env.DEFAULT_ADMIN_PASSWORD || "password",
      },
    })
  } catch (e) {
    // Catch "result is not allowed to be read back" error then try get created user using dangerous prisma client
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      // https://www.prisma.io/docs/orm/reference/error-reference#p2004
      if (e.code === "P2004") {
        // Find user with email hash and assign role
        const adminUser = await dangerousPrisma.user.update({
          where: {
            emailHash,
          },
          data: {
            userRoles: {
              connect: [role],
            },
          },
          include: {
            userRoles: { include: { permissions: true } },
            modelPermissions: true,
          },
        })
        console.log("Created default admin user:", adminUser)
      }
    }
  }
}

main()
  .then(async () => {
    await defaultPrisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await defaultPrisma.$disconnect()
    process.exit(1)
  })
