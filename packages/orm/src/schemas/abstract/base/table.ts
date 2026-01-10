import { sql } from "drizzle-orm"
import { timestamp, uuid } from "drizzle-orm/pg-core"

export const tableBase = {
  id: uuid()
    .primaryKey()
    .default(sql`uuidv7()`),
  createdAt: timestamp({ withTimezone: true, mode: "string" })
    .default(sql`(now() AT TIME ZONE 'utc'::text)`)
    .notNull(),
  updatedAt: timestamp({ withTimezone: true, mode: "string" })
    .default(sql`(now() AT TIME ZONE 'utc'::text)`)
    .notNull()
    .$onUpdateFn(() => sql`(now() AT TIME ZONE 'utc'::text)`),
}
