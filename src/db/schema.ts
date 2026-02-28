import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  avatar: text("avatar"),
  bio: text("bio"),
  role: text("role", { enum: ["admin", "user"] }).notNull().default("user"),
  status: text("status", { enum: ["active", "banned"] }).notNull().default("active"),
  shareToken: text("share_token"),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
});

export const jumpRecords = sqliteTable("jump_records", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  date: text("date").notNull(), // YYYY-MM-DD
  count: integer("count").notNull(),
  durationMinutes: integer("duration_minutes"),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type JumpRecord = typeof jumpRecords.$inferSelect;
export type NewJumpRecord = typeof jumpRecords.$inferInsert;
