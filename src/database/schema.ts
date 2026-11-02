import { jsonb, pgTable, text, timestamp } from 'drizzle-orm/pg-core';

// Site-wide settings stored as one JSON document per key (e.g. "footer")
export const settings = pgTable('settings', {
  key: text('key').primaryKey(),
  value: jsonb('value').notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
