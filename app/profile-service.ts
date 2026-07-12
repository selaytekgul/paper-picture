import { env } from "cloudflare:workers";
import { collection, collectionLabel, maximumCollectionScore, playablePapers, pointsForImagesSeen } from "../data/papers";
import { getChatGPTUser } from "./chatgpt-auth";

const PRIVACY_VERSION = "2026-07-12-v2";
const DAY = 24 * 60 * 60 * 1000;
const ABANDONED_SESSION_RETENTION = 7 * DAY;
const FEEDBACK_RETENTION = 365 * DAY;
const FEEDBACK_CATEGORIES = new Set(["gameplay", "difficulty", "metadata", "copyright", "accessibility", "bug", "privacy", "other"]);
const FEEDBACK_STATUSES = new Set(["new", "reviewing", "resolved"]);

type D1Result<T> = { results?: T[]; success: boolean };
type D1Statement = {
  bind: (...values: unknown[]) => D1Statement;
  first: <T>() => Promise<T | null>;
  run: () => Promise<D1Result<unknown>>;
  all: <T>() => Promise<D1Result<T>>;
};
type D1Database = {
  prepare: (sql: string) => D1Statement;
  batch: (statements: D1Statement[]) => Promise<D1Result<unknown>[]>;
};

type Identity = { userKey: string; suggestedName: string };

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export function json(data: unknown, status = 200) {
  return Response.json(data, {
    status,
    headers: { "Cache-Control": "private, no-store", Vary: "oai-authenticated-user-email" },
  });
}

export function apiError(error: unknown) {
  if (error instanceof ApiError) return json({ error: error.message }, error.status);
  if (error instanceof SyntaxError) return json({ error: "The request body is not valid JSON." }, 400);
  const safeError = error instanceof Error ? { name: error.name, message: error.message } : { name: "UnknownError", message: "Unknown server error" };
  console.error(JSON.stringify({ event: "paper_picture_api_error", ...safeError }));
  return json({ error: "Something went wrong while saving your data." }, 500);
}

export async function requireIdentity(): Promise<Identity> {
  const user = await getChatGPTUser();
  if (!user) throw new ApiError(401, "Sign in with ChatGPT to continue.");
  const secret = getEnvironment().PROFILE_ID_SECRET;
  if (!secret) throw new ApiError(503, "Profile storage is not configured yet.");
  return {
    userKey: await hmacHex(secret, user.email.trim().toLowerCase()),
    suggestedName: cleanDisplayName(user.fullName ?? "Researcher"),
  };
}

export function isAdminEmail(email: string) {
  const configuredEmail = getEnvironment().ADMIN_EMAIL?.trim().toLowerCase();
  return Boolean(configuredEmail && email.trim().toLowerCase() === configuredEmail);
}

export async function requireAdmin() {
  const user = await getChatGPTUser();
  if (!user) throw new ApiError(401, "Sign in with ChatGPT to continue.");
  if (!isAdminEmail(user.email)) throw new ApiError(404, "Not found.");
  return user;
}

export async function ensureProfile(identity: Identity) {
  const db = getDatabase();
  const now = Date.now();
  await db.prepare(`
    INSERT INTO profiles
      (user_key, display_name, created_at, updated_at, last_seen_at, privacy_version, profile_status)
    VALUES (?, ?, ?, ?, ?, ?, 'active')
    ON CONFLICT(user_key) DO UPDATE SET
      last_seen_at = excluded.last_seen_at,
      privacy_version = excluded.privacy_version
  `).bind(identity.userKey, identity.suggestedName, now, now, now, PRIVACY_VERSION).run();
  await applyRetention(db, identity.userKey, now);
}

export async function getProfile(identity: Identity) {
  await ensureProfile(identity);
  await enforceRateLimit(identity, "profile-read", 120, 60 * 60 * 1000);
  return readProfile(identity);
}

async function readProfile(identity: Identity) {
  const db = getDatabase();
  const profile = await db.prepare(`
    SELECT display_name AS displayName, created_at AS createdAt,
      updated_at AS updatedAt, privacy_version AS privacyVersion
    FROM profiles WHERE user_key = ? AND profile_status = 'active'
  `).bind(identity.userKey).first<Record<string, unknown>>();
  const stats = await db.prepare(`
    SELECT COUNT(*) AS gamesPlayed, COALESCE(MAX(score), 0) AS bestScore,
      COALESCE(SUM(correct_count), 0) AS correctAnswers,
      COALESCE(SUM(round_count), 0) AS totalAnswers,
      COALESCE(SUM(figures_revealed), 0) AS figuresRevealed,
      COALESCE(SUM(assisted_count), 0) AS assistedAnswers
    FROM game_sessions WHERE user_key = ? AND status = 'complete'
  `).bind(identity.userKey).first<Record<string, number | null>>();
  const recent = await db.prepare(`
    SELECT id, collection_id AS collectionId, collection_version AS collectionVersion,
      score_class AS scoreClass, score, maximum_score AS maximumScore,
      correct_count AS correctCount, round_count AS roundCount,
      figures_revealed AS figuresRevealed, assisted_count AS assistedCount,
      completed_at AS completedAt
    FROM game_sessions
    WHERE user_key = ? AND status = 'complete'
    ORDER BY completed_at DESC LIMIT 10
  `).bind(identity.userKey).all<Record<string, unknown>>();

  const totalAnswers = Number(stats?.totalAnswers ?? 0);
  const correctAnswers = Number(stats?.correctAnswers ?? 0);
  return {
    profile,
    collection: { id: collection.id, label: collection.label, version: collection.version },
    stats: {
      gamesPlayed: Number(stats?.gamesPlayed ?? 0),
      bestScore: Number(stats?.bestScore ?? 0),
      correctAnswers,
      totalAnswers,
      accuracy: totalAnswers ? Math.round((correctAnswers / totalAnswers) * 100) : 0,
      figuresRevealed: Number(stats?.figuresRevealed ?? 0),
      assistedAnswers: Number(stats?.assistedAnswers ?? 0),
    },
    recent: (recent.results ?? []).map((game) => ({ ...game, collectionLabel: collectionLabel(String(game.collectionId)) })),
  };
}

export async function updateProfile(identity: Identity, displayName: unknown) {
  await ensureProfile(identity);
  await enforceRateLimit(identity, "profile-write", 20, 60 * 60 * 1000);
  if (typeof displayName !== "string") throw new ApiError(400, "Display name is required.");
  const cleaned = cleanDisplayName(displayName);
  const now = Date.now();
  await getDatabase().prepare(`
    UPDATE profiles SET display_name = ?, updated_at = ?, last_seen_at = ?
    WHERE user_key = ? AND profile_status = 'active'
  `).bind(cleaned, now, now, identity.userKey).run();
  return readProfile(identity);
}

export async function deleteProfile(identity: Identity) {
  const db = getDatabase();
  await db.batch([
    db.prepare("DELETE FROM feedback WHERE user_key = ?").bind(identity.userKey),
    db.prepare("DELETE FROM rate_limits WHERE user_key = ?").bind(identity.userKey),
    db.prepare("DELETE FROM round_attempts WHERE session_id IN (SELECT id FROM game_sessions WHERE user_key = ?)").bind(identity.userKey),
    db.prepare("DELETE FROM game_sessions WHERE user_key = ?").bind(identity.userKey),
    db.prepare("DELETE FROM profiles WHERE user_key = ?").bind(identity.userKey),
  ]);
}

export async function createGameSession(identity: Identity) {
  await ensureProfile(identity);
  await enforceRateLimit(identity, "game-start", 30, 60 * 60 * 1000);
  const id = crypto.randomUUID();
  const now = Date.now();
  const paperIds = shuffledPaperIds();
  await getDatabase().prepare(`
    INSERT INTO game_sessions
      (id, user_key, collection_id, collection_version, paper_order, score_class,
       started_at, status, score, maximum_score, correct_count, round_count,
       figures_revealed, assisted_count)
    VALUES (?, ?, ?, ?, ?, 'casual', ?, 'started', 0, ?, 0, ?, 0, 0)
  `).bind(id, identity.userKey, collection.id, collection.version, JSON.stringify(paperIds), now, maximumCollectionScore, playablePapers.length).run();
  return { id, collectionId: collection.id, collectionVersion: collection.version, collectionLabel: collection.label, paperIds, scoreClass: "casual", startedAt: now };
}

export async function recordAttempt(identity: Identity, sessionId: string, body: unknown) {
  await enforceRateLimit(identity, "game-write", 240, 60 * 60 * 1000);
  if (!body || typeof body !== "object") throw new ApiError(400, "Attempt data is required.");
  const input = body as Record<string, unknown>;
  const paper = playablePapers.find((item) => item.id === input.paperId);
  if (!paper) throw new ApiError(400, "That paper is not in this collection.");
  if (!Number.isInteger(input.selectedOption) || Number(input.selectedOption) < 0 || Number(input.selectedOption) >= paper.options.length) {
    throw new ApiError(400, "Select one of the available answers.");
  }
  if (!Number.isInteger(input.imagesSeen) || Number(input.imagesSeen) < 1 || Number(input.imagesSeen) > paper.figures.length) {
    throw new ApiError(400, "The number of revealed figures is invalid.");
  }

  const db = getDatabase();
  const session = await ownedSession(db, identity.userKey, sessionId);
  if (session.status !== "started") throw new ApiError(409, "This game is already complete.");
  if (!parsePaperOrder(session.paper_order).includes(paper.id)) throw new ApiError(400, "That paper is not part of this game.");
  const selectedOption = Number(input.selectedOption);
  const imagesSeen = Number(input.imagesSeen);
  const assisted = input.assisted === true;
  const wasCorrect = selectedOption === paper.correct;
  const scoreAwarded = wasCorrect ? pointsForImagesSeen(imagesSeen) : 0;
  const id = crypto.randomUUID();
  const answeredAt = Date.now();
  await db.prepare(`
    INSERT INTO round_attempts
      (id, session_id, paper_id, question_type, selected_option, was_correct,
       score_awarded, images_seen, assisted, answered_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(session_id, paper_id) DO NOTHING
  `).bind(id, sessionId, paper.id, paper.questionType, selectedOption, wasCorrect ? 1 : 0, scoreAwarded, imagesSeen, assisted ? 1 : 0, answeredAt).run();

  return db.prepare(`
    SELECT paper_id AS paperId, selected_option AS selectedOption,
      was_correct AS wasCorrect, score_awarded AS scoreAwarded,
      images_seen AS imagesSeen, assisted, answered_at AS answeredAt
    FROM round_attempts WHERE session_id = ? AND paper_id = ?
  `).bind(sessionId, paper.id).first<Record<string, unknown>>();
}

export async function completeGameSession(identity: Identity, sessionId: string) {
  await enforceRateLimit(identity, "game-write", 240, 60 * 60 * 1000);
  const db = getDatabase();
  const session = await ownedSession(db, identity.userKey, sessionId);
  if (session.status === "complete") return publicSession(session);
  const totals = await db.prepare(`
    SELECT COUNT(*) AS attemptCount, COALESCE(SUM(score_awarded), 0) AS score,
      COALESCE(SUM(was_correct), 0) AS correctCount,
      COALESCE(SUM(images_seen), 0) AS figuresRevealed,
      COALESCE(SUM(assisted), 0) AS assistedCount
    FROM round_attempts WHERE session_id = ?
  `).bind(sessionId).first<Record<string, number>>();
  if (Number(totals?.attemptCount ?? 0) !== Number(session.round_count)) throw new ApiError(409, "Answer every paper before completing the game.");
  const completedAt = Date.now();
  const assistedCount = Number(totals?.assistedCount ?? 0);
  await db.prepare(`
    UPDATE game_sessions SET status = 'complete', completed_at = ?, score = ?,
      correct_count = ?, figures_revealed = ?, assisted_count = ?, score_class = ?
    WHERE id = ? AND user_key = ? AND status = 'started'
  `).bind(completedAt, Number(totals?.score ?? 0), Number(totals?.correctCount ?? 0), Number(totals?.figuresRevealed ?? 0), assistedCount, assistedCount ? "assisted" : "casual", sessionId, identity.userKey).run();
  return publicSession(await ownedSession(db, identity.userKey, sessionId));
}

export async function submitFeedback(identity: Identity, body: unknown) {
  await ensureProfile(identity);
  await enforceRateLimit(identity, "feedback", 10, DAY);
  if (!body || typeof body !== "object") throw new ApiError(400, "Feedback data is required.");
  const input = body as Record<string, unknown>;
  const category = typeof input.category === "string" ? input.category : "";
  const message = typeof input.message === "string" ? input.message.replace(/\s+/g, " ").trim() : "";
  const rating = input.rating === null || input.rating === undefined || input.rating === "" ? null : Number(input.rating);
  const paperId = typeof input.paperId === "string" && input.paperId ? input.paperId : null;
  const sessionId = typeof input.sessionId === "string" && input.sessionId ? input.sessionId : null;
  if (!FEEDBACK_CATEGORIES.has(category)) throw new ApiError(400, "Choose a valid feedback category.");
  if (message.length < 10 || message.length > 2000) throw new ApiError(400, "Feedback must be 10–2000 characters.");
  if (rating !== null && (!Number.isInteger(rating) || rating < 1 || rating > 5)) throw new ApiError(400, "Rating must be between 1 and 5.");
  if (paperId && !playablePapers.some((paper) => paper.id === paperId)) throw new ApiError(400, "That paper is not in this collection.");
  if (sessionId) await ownedSession(getDatabase(), identity.userKey, sessionId);
  const id = crypto.randomUUID();
  await getDatabase().prepare(`
    INSERT INTO feedback
      (id, user_key, collection_id, session_id, paper_id, category, message, rating, created_at, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'new')
  `).bind(id, identity.userKey, collection.id, sessionId, paperId, category, message, rating, Date.now()).run();
  return { id, received: true, retentionDays: 365 };
}

export async function listFeedback() {
  await requireAdmin();
  const rows = await getDatabase().prepare(`
    SELECT f.id, f.collection_id AS collectionId, f.paper_id AS paperId,
      f.category, f.message, f.rating, f.created_at AS createdAt, f.status,
      p.display_name AS displayName
    FROM feedback f
    INNER JOIN profiles p ON p.user_key = f.user_key
    ORDER BY f.created_at DESC
    LIMIT 500
  `).all<Record<string, unknown>>();
  const titles = new Map(playablePapers.map((paper) => [paper.id, paper.title]));
  return {
    feedback: (rows.results ?? []).map((item) => ({
      ...item,
      paperTitle: typeof item.paperId === "string" ? titles.get(item.paperId) ?? item.paperId : null,
    })),
    collection: { id: collection.id, label: collection.label },
  };
}

export async function updateFeedbackStatus(id: string, status: unknown) {
  await requireAdmin();
  if (!id || id.length > 100) throw new ApiError(400, "A valid feedback ID is required.");
  if (typeof status !== "string" || !FEEDBACK_STATUSES.has(status)) {
    throw new ApiError(400, "Choose a valid feedback status.");
  }
  const db = getDatabase();
  await db.prepare("UPDATE feedback SET status = ? WHERE id = ?").bind(status, id).run();
  const updated = await db.prepare("SELECT id, status FROM feedback WHERE id = ?").bind(id).first<{ id: string; status: string }>();
  if (!updated) throw new ApiError(404, "Feedback entry not found.");
  return updated;
}

async function enforceRateLimit(identity: Identity, action: string, limit: number, windowMs: number) {
  const db = getDatabase();
  const windowStart = Math.floor(Date.now() / windowMs) * windowMs;
  const id = `${identity.userKey}:${action}:${windowStart}`;
  await db.prepare(`
    INSERT INTO rate_limits (id, user_key, action, window_start, request_count)
    VALUES (?, ?, ?, ?, 1)
    ON CONFLICT(id) DO UPDATE SET request_count = request_count + 1
  `).bind(id, identity.userKey, action, windowStart).run();
  const row = await db.prepare("SELECT request_count AS requestCount FROM rate_limits WHERE id = ?").bind(id).first<{ requestCount: number }>();
  if (Number(row?.requestCount ?? 0) > limit) throw new ApiError(429, "Too many requests. Please wait and try again.");
}

async function applyRetention(db: D1Database, userKey: string, now: number) {
  const abandonedBefore = now - ABANDONED_SESSION_RETENTION;
  await db.batch([
    db.prepare("DELETE FROM round_attempts WHERE session_id IN (SELECT id FROM game_sessions WHERE user_key = ? AND status = 'started' AND started_at < ?)").bind(userKey, abandonedBefore),
    db.prepare("DELETE FROM game_sessions WHERE user_key = ? AND status = 'started' AND started_at < ?").bind(userKey, abandonedBefore),
    db.prepare("DELETE FROM feedback WHERE user_key = ? AND created_at < ?").bind(userKey, now - FEEDBACK_RETENTION),
    db.prepare("DELETE FROM rate_limits WHERE user_key = ? AND window_start < ?").bind(userKey, now - 2 * DAY),
  ]);
}

function shuffledPaperIds() {
  const ids = playablePapers.map((paper) => paper.id);
  for (let index = ids.length - 1; index > 0; index -= 1) {
    const random = crypto.getRandomValues(new Uint32Array(1))[0] / 2 ** 32;
    const swap = Math.floor(random * (index + 1));
    [ids[index], ids[swap]] = [ids[swap], ids[index]];
  }
  return ids;
}

function parsePaperOrder(value: unknown) {
  if (typeof value !== "string") return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) && parsed.every((item) => typeof item === "string") ? parsed : [];
  } catch {
    return [];
  }
}

function cleanDisplayName(value: string) {
  const clean = value.replace(/\s+/g, " ").trim();
  if (clean.length < 2 || clean.length > 40) throw new ApiError(400, "Display name must be 2–40 characters.");
  return clean;
}

async function ownedSession(db: D1Database, userKey: string, sessionId: string) {
  const session = await db.prepare(`
    SELECT id, status, collection_id, collection_version, paper_order, score_class,
      score, maximum_score, correct_count, round_count, figures_revealed,
      assisted_count, completed_at
    FROM game_sessions WHERE id = ? AND user_key = ?
  `).bind(sessionId, userKey).first<Record<string, unknown>>();
  if (!session) throw new ApiError(404, "Game session not found.");
  return session;
}

function publicSession(session: Record<string, unknown>) {
  return {
    id: session.id,
    status: session.status,
    collectionId: session.collection_id,
    collectionVersion: session.collection_version,
    scoreClass: session.score_class,
    score: Number(session.score),
    maximumScore: Number(session.maximum_score),
    correctCount: Number(session.correct_count),
    roundCount: Number(session.round_count),
    figuresRevealed: Number(session.figures_revealed),
    assistedCount: Number(session.assisted_count),
    completedAt: session.completed_at,
  };
}

async function hmacHex(secret: string, value: string) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(value));
  return [...new Uint8Array(signature)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function getEnvironment() {
  return env as unknown as { DB?: D1Database; PROFILE_ID_SECRET?: string; ADMIN_EMAIL?: string };
}

function getDatabase() {
  const db = getEnvironment().DB;
  if (!db) throw new ApiError(503, "Profile storage is unavailable.");
  return db;
}
