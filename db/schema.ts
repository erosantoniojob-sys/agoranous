import { integer, jsonb, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core'

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
