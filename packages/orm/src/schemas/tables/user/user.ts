import { encryptedText, hashedText, tableBase } from "@/schemas"
import { pgTable, text } from "drizzle-orm/pg-core"

export const usersTable = pgTable("users", {
  ...tableBase,
  givenName: text().notNull(),
  familyName: text(),
  email: encryptedText().notNull().unique(),
  emailHash: hashedText({
    lowercase: true,
    secret: process.env.DB_EMAIL_PEPPER,
  })
    .notNull()
    .unique(),
  password: text().notNull(),
})

export type SelectUser = typeof usersTable.$inferSelect
export type InsertUser = typeof usersTable.$inferInsert
