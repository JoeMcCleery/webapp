import { tableBase } from "@/schemas"
import { pgTable, text } from "drizzle-orm/pg-core"

export const usersTable = pgTable("users", {
  ...tableBase,
  givenName: text().notNull(),
  familyName: text(),
  email: text().notNull().unique(),
})
