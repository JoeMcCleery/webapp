import { defineConfig } from "drizzle-kit"

export default defineConfig({
  out: "./src/migrations",
  schema: "./src/schemas",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URI!,
  },
  casing: "snake_case",
})
