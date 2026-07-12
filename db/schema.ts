import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const profiles = sqliteTable("profiles", {
  userKey: text("user_key").primaryKey(),
  displayName: text("display_name").notNull(),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
  lastSeenAt: integer("last_seen_at").notNull(),
  privacyVersion: text("privacy_version").notNull(),
  profileStatus: text("profile_status").notNull().default("active"),
});

export const gameSessions = sqliteTable("game_sessions", {
  id: text("id").primaryKey(),
  userKey: text("user_key").notNull().references(() => profiles.userKey, { onDelete: "cascade" }),
  collectionId: text("collection_id").notNull(),
  collectionVersion: text("collection_version").notNull().default("legacy"),
  paperOrder: text("paper_order").notNull().default("[]"),
  scoreClass: text("score_class").notNull().default("casual"),
  startedAt: integer("started_at").notNull(),
  completedAt: integer("completed_at"),
  status: text("status").notNull().default("started"),
  score: integer("score").notNull().default(0),
  maximumScore: integer("maximum_score").notNull(),
  correctCount: integer("correct_count").notNull().default(0),
  roundCount: integer("round_count").notNull(),
  figuresRevealed: integer("figures_revealed").notNull().default(0),
  assistedCount: integer("assisted_count").notNull().default(0),
}, (table) => [
  index("game_sessions_user_completed_idx").on(table.userKey, table.completedAt),
  index("game_sessions_user_status_idx").on(table.userKey, table.status),
]);

export const roundAttempts = sqliteTable("round_attempts", {
  id: text("id").primaryKey(),
  sessionId: text("session_id").notNull().references(() => gameSessions.id, { onDelete: "cascade" }),
  paperId: text("paper_id").notNull(),
  questionType: text("question_type").notNull(),
  selectedOption: integer("selected_option").notNull(),
  wasCorrect: integer("was_correct", { mode: "boolean" }).notNull(),
  scoreAwarded: integer("score_awarded").notNull(),
  imagesSeen: integer("images_seen").notNull(),
  assisted: integer("assisted", { mode: "boolean" }).notNull().default(false),
  answeredAt: integer("answered_at").notNull(),
}, (table) => [
  uniqueIndex("round_attempts_session_paper_unique").on(table.sessionId, table.paperId),
  index("round_attempts_session_idx").on(table.sessionId),
  index("round_attempts_paper_idx").on(table.paperId),
]);

export const feedback = sqliteTable("feedback", {
  id: text("id").primaryKey(),
  userKey: text("user_key").notNull().references(() => profiles.userKey, { onDelete: "cascade" }),
  collectionId: text("collection_id").notNull(),
  sessionId: text("session_id"),
  paperId: text("paper_id"),
  category: text("category").notNull(),
  message: text("message").notNull(),
  rating: integer("rating"),
  createdAt: integer("created_at").notNull(),
  status: text("status").notNull().default("new"),
}, (table) => [
  index("feedback_user_created_idx").on(table.userKey, table.createdAt),
  index("feedback_status_created_idx").on(table.status, table.createdAt),
]);

export const rateLimits = sqliteTable("rate_limits", {
  id: text("id").primaryKey(),
  userKey: text("user_key").notNull().references(() => profiles.userKey, { onDelete: "cascade" }),
  action: text("action").notNull(),
  windowStart: integer("window_start").notNull(),
  requestCount: integer("request_count").notNull().default(1),
}, (table) => [
  index("rate_limits_user_window_idx").on(table.userKey, table.windowStart),
]);
