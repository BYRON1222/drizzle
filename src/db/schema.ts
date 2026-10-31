import {
  pgTable,
  serial,
  varchar,
  integer,
  timestamp,
  index,
} from "drizzle-orm/pg-core";

export const books = pgTable(
  "books",
  {
    id: serial("id").primaryKey(),
    title: varchar("title", { length: 200 }).notNull(),
    author: varchar("author", { length: 150 }).notNull(),
    isbn: varchar("isbn", { length: 20 }).notNull().unique(),
    publishedYear: integer("published_year"),
    createdAt: timestamp("created_at").defaultNow().notNull(),

    // --- Evolución del esquema (migración 0001) ---
    genre: varchar("genre", { length: 80 }),
    stock: integer("stock").notNull().default(1),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [index("books_author_idx").on(table.author)],
);

export type Book = typeof books.$inferSelect;
export type NewBook = typeof books.$inferInsert;
