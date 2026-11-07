import { sql } from "drizzle-orm";
import { bigint, boolean, pgSequence, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const linkIdSequence = pgSequence("link_id_seq", {
  startWith: 1,
  increment: 1,
  cycle: false,
});

export const links = pgTable("links", {
  id: bigint("id", { mode: "bigint" })
    .primaryKey()
    .default(sql`nextval('link_id_seq'::regclass)`),
  code: varchar("code", { length: 11 }).notNull().unique(),
  destination: text("destination").notNull(),
  disabled: boolean("disabled").notNull().default(false),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
