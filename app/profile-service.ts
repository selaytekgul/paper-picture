import { env } from "cloudflare:workers";
import { maximumCollectionScore, playablePapers, pointsForImagesSeen } from "../data/papers";
import { getChatGPTUser } from "./chatgpt-auth";

const PRIVACY_VERSION = "2026-07-12";
const COLLECTION_ID = "open-graphics-01";

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

type Identity = {
  userKey: string;
  suggestedName: string;
};

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export function json(data: unknown, status = 200) {
  return Response.json(data, {
    status,
    headers: {
      "Cache-Control": "private, no-store",
      Vary: "oai-authenticated-user-email",
    },
  });
}

export function apiError(error: unknown) {
  if (error instanceof ApiError) return json({ error: error.message }, error.status);
  if (error instanceof SyntaxError) return json({ error: "The request body is not valid JSON." }, 400);
  console.error(error);
  return json({ error: "Something went wrong while saving your profile." }, 500);
}

export async function requireIdentity(): Promise<Identity> {
  const user = await getChatGPTUser();
  if (!user) throw new ApiError(401, "Sign in with ChatGPT to save your progress.");

  const secret = getEnvironment().PROFILE_ID_SECRET;
  if (!secret) throw new ApiError(503, "Profile storage is not configured yet.");

  return {
    userKey: await hmacHex(secret, user.email.trim().toLowerCase()),
    suggestedName: cleanDisplayName(user.fullName ?? "Researcher"),
  };
}

export async function ensureProfile(identity: Identity) {
  const db = getDatabase();
  const now = Date.now();
  await db.prepare(`
    INSERT INTO profiles
      (user_key, display_name, created_at, updated_at, last_seen_at, privacy_version, profile_status)
    VALUES (?, ?, ?, ?, ?, ?, 'active')
    ON CONFLICT(user_key) DO UPDATE SET last_seen_at = excluded.last_seen_at
  `).bind(identity.userKey, identity.suggestedName, now, now, now, PRIVACY_VERSION).run();
}

export async function getProfile(identity: Identity) {
  await ensureProfile(identity);
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
      COALESCE(SUM(figures_revealed), 0) AS figuresRevealed
    FROM game_sessions WHERE user_key = ? AND status = 'complete'
  `).bind(identity.userKey).first<Record<string, number | null>>();
  const recent = await db.prepare(`
    SELECT id, collection_id AS collectionId, score, maximum_score AS maximumScore,
      correct_count AS correctCount, round_count AS roundCount,
      figures_revealed AS figuresRevealed, completed_at AS completedAt
    FROM game_sessions
    WHERE user_key = ? AND status = 'complete'
    ORDER BY completed_at DESC LIMIT 10
  `).bind(identity.userKey).all<Record<string, unknown>>();

  const totalAnswers = Number(stats?.totalAnswers ?? 0);
  const correctAnswers = Number(stats?.correctAnswers ?? 0);
  return {
    profile,
    stats: {
      gamesPlayed: Number(stats?.gamesPlayed ?? 0),
      bestScore: Number(stats?.bestScore ?? 0),
      correctAnswers,
      totalAnswers,
      accuracy: totalAnswers ? Math.round((correctAnswers / totalAnswers) * 100) : 0,
      figuresRevealed: Number(stats?.figuresRevealed ?? 0),
    },
    recent: recent.results ?? [],
  };
}

export async function updateProfile(identity: Identity, displayName: unknown) {
  await ensureProfile(identity);
  if (typeof displayName !== "string") throw new ApiError(400, "Display name is required.");
  const cleaned = cleanDisplayName(displayName);
  const now = Date.now();
  await getDatabase().prepare(`
    UPDATE profiles SET display_name = ?, updated_at = ?, last_seen_at = ?
    WHERE user_key = ? AND profile_status = 'active'
  `).bind(cleaned, now, now, identity.userKey).run();
  return getProfile(identity);
}

export async function deleteProfile(identity: Identity) {
  const db = getDatabase();
  await db.batch([
    db.prepare("DELETE FROM round_attempts WHERE session_id IN (SELECT id FROM game_sessions WHERE user_key = ?)").bind(identity.userKey),
    db.prepare("DELETE FROM game_sessions WHERE user_key = ?").bind(identity.userKey),
    db.prepare("DELETE FROM profiles WHERE user_key = ?").bind(identity.userKey),
  ]);
}

export async function createGameSession(identity: Identity) {
  await ensureProfile(identity);
  const id = crypto.randomUUID();
  const now = Date.now();
  await getDatabase().prepare(`
    INSERT INTO game_sessions
      (id, user_key, collection_id, score_class, started_at, status, score,
       maximum_score, correct_count, round_count, figures_revealed)
    VALUES (?, ?, ?, 'casual', ?, 'started', 0, ?, 0, ?, 0)
  `).bind(id, identity.userKey, COLLECTION_ID, now, maximumCollectionScore, playablePapers.length).run();
  return { id, collectionId: COLLECTION_ID, scoreClass: "casual", startedAt: now };
}

export async function recordAttempt(identity: Identity, sessionId: string, body: unknown) {
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
  const selectedOption = Number(input.selectedOption);
  const imagesSeen = Number(input.imagesSeen);
  const wasCorrect = selectedOption === paper.correct;
  const scoreAwarded = wasCorrect ? pointsForImagesSeen(imagesSeen) : 0;
  const id = crypto.randomUUID();
  const answeredAt = Date.now();
  await db.prepare(`
    INSERT INTO round_attempts
      (id, session_id, paper_id, question_type, selected_option, was_correct,
       score_awarded, images_seen, answered_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(session_id, paper_id) DO NOTHING
  `).bind(id, sessionId, paper.id, paper.questionType, selectedOption, wasCorrect ? 1 : 0, scoreAwarded, imagesSeen, answeredAt).run();

  const attempt = await db.prepare(`
    SELECT paper_id AS paperId, selected_option AS selectedOption,
      was_correct AS wasCorrect, score_awarded AS scoreAwarded,
      images_seen AS imagesSeen, answered_at AS answeredAt
    FROM round_attempts WHERE session_id = ? AND paper_id = ?
  `).bind(sessionId, paper.id).first<Record<string, unknown>>();
  return attempt;
}

export async function completeGameSession(identity: Identity, sessionId: string) {
  const db = getDatabase();
  const session = await ownedSession(db, identity.userKey, sessionId);
  if (session.status === "complete") return publicSession(session);

  const totals = await db.prepare(`
    SELECT COUNT(*) AS attemptCount, COALESCE(SUM(score_awarded), 0) AS score,
      COALESCE(SUM(was_correct), 0) AS correctCount,
      COALESCE(SUM(images_seen), 0) AS figuresRevealed
    FROM round_attempts WHERE session_id = ?
  `).bind(sessionId).first<Record<string, number>>();
  if (Number(totals?.attemptCount ?? 0) !== Number(session.round_count)) {
    throw new ApiError(409, "Answer every paper before completing the game.");
  }
  const completedAt = Date.now();
  await db.prepare(`
    UPDATE game_sessions SET status = 'complete', completed_at = ?, score = ?,
      correct_count = ?, figures_revealed = ?
    WHERE id = ? AND user_key = ? AND status = 'started'
  `).bind(completedAt, Number(totals?.score ?? 0), Number(totals?.correctCount ?? 0), Number(totals?.figuresRevealed ?? 0), sessionId, identity.userKey).run();
  return publicSession(await ownedSession(db, identity.userKey, sessionId));
}

function cleanDisplayName(value: string) {
  const clean = value.replace(/\s+/g, " ").trim();
  if (clean.length < 2 || clean.length > 40) throw new ApiError(400, "Display name must be 2–40 characters.");
  return clean;
}

async function ownedSession(db: D1Database, userKey: string, sessionId: string) {
  const session = await db.prepare(`
    SELECT id, status, score, maximum_score, correct_count, round_count,
      figures_revealed, completed_at FROM game_sessions
    WHERE id = ? AND user_key = ?
  `).bind(sessionId, userKey).first<Record<string, unknown>>();
  if (!session) throw new ApiError(404, "Game session not found.");
  return session;
}

function publicSession(session: Record<string, unknown>) {
  return {
    id: session.id,
    status: session.status,
    score: Number(session.score),
    maximumScore: Number(session.maximum_score),
    correctCount: Number(session.correct_count),
    roundCount: Number(session.round_count),
    figuresRevealed: Number(session.figures_revealed),
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
  return env as unknown as { DB?: D1Database; PROFILE_ID_SECRET?: string };
}

function getDatabase() {
  const db = getEnvironment().DB;
  if (!db) throw new ApiError(503, "Profile storage is unavailable.");
  return db;
}
