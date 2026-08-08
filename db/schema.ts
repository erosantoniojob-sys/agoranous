import { integer, jsonb, pgTable, primaryKey, serial, text, timestamp } from 'drizzle-orm/pg-core'

export const libraryItems = pgTable('library_items', {
  id: serial().primaryKey(),
  libraryId: text('library_id').notNull(),
  category: text().notNull(),
  title: text().notNull(),
  creator: text().notNull(),
  year: integer(),
  synopsis: text().notNull(),
  genres: jsonb().$type<string[]>().notNull().default([]),
  coverUrl: text('cover_url'),
  source: text().notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const userData = pgTable('user_data', {
  userId: text('user_id').notNull(),
  collection: text().notNull(),
  data: jsonb().$type<unknown>().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [primaryKey({ columns: [table.userId, table.collection] })])
