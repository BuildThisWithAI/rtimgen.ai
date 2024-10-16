import { createId } from "@paralleldrive/cuid2";
import { sql } from "drizzle-orm";
import { sqliteTable } from "drizzle-orm/sqlite-core";

export const POSTS = sqliteTable("posts", (t) => ({
  id: t.text().primaryKey().$defaultFn(createId),
  text: t.text().notNull(),
  createdAt: t.text().notNull().default(sql`(CURRENT_TIMESTAMP)`),
  createdBy: t.text().notNull(),
  participants: t.integer().notNull(),
}));

export const room = sqliteTable("room", (t) => ({
  id: t.text().primaryKey().$defaultFn(createId),
  finalPrompt: t.text().notNull(),
  createdAt: t.text().notNull().default(sql`(CURRENT_TIMESTAMP)`),
}));

export const generatedImage = sqliteTable("generatedImage", (t) => ({
  id: t.text().primaryKey().$defaultFn(createId),
  roomId: t.text().notNull(),
  prompt: t.text().notNull(),
  b64: t.text().notNull(),
  createdAt: t.text().notNull().default(sql`(CURRENT_TIMESTAMP)`),
}));
