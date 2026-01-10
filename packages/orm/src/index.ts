import { drizzle } from "drizzle-orm/node-postgres"

export const db = drizzle({
  connection: process.env.DATABASE_URI!,
  casing: "snake_case",
})
