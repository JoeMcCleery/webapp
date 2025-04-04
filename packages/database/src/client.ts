import { PrismaClient } from "./generated/client";
import { enhance } from "@zenstackhq/runtime";

export const prisma = new PrismaClient();

export function getEnhancedPrisma(user?: any) {
  return enhance(prisma, { user });
}
