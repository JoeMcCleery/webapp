import { PrismaClient } from "./generated/client";
import { enhance } from "@zenstackhq/runtime";

export const prisma = new PrismaClient();

const globalForPrisma = global as unknown as { prisma: typeof prisma };

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export function getEnhancedPrisma(user?: any) {
  return enhance(prisma, { user });
}
