# Paper Picture: Player Profiles Plan

> **Status:** Historical design plan. The private profile, saved-session, assisted-play, feedback, retention, deletion, rate-limit, and owner-inbox work described here is implemented. The live schema differs in some details; use `db/schema.ts`, `app/profile-service.ts`, `PROJECT_STATUS.md`, and `ROADMAP.md` as the current sources of truth.

## Objective

Add private, durable player profiles to Paper Picture using the site’s existing ChatGPT sign-in. A player should be able to return on another visit, see personal statistics and recent games, and delete their stored data.

The initial profile system is for personal progress, not public competition.

## Product decision

### Build now

- Automatic recognition of the signed-in ChatGPT user
- Private profile visible only to that user
- Editable display name
- Games played
- Best score and total score
- Correct answers and accuracy
- Figures revealed
- Papers encountered
- Recent completed-game history
- Account-data deletion
- Clear privacy explanation

### Defer

- Public profiles
- Global or institutional leaderboards
- Friends, follows, comments, and messaging
- Avatars and image uploads
- Achievements and streaks
- Profile search
- Independent email/password accounts
- Competitive or prize-bearing scores

These deferred features require additional moderation, consent, abuse prevention, identity policy, and stronger server-authoritative gameplay.

## Trust model

The current game sends question content and correct-option data to the browser. A technically motivated player can inspect or manipulate it. Therefore:

- Initial profile scores are labeled **personal/casual statistics**.
- They are suitable for tracking a player’s own progress.
- They must not power public rankings, awards, or competition.
- A future competitive mode must keep answers server-side and have the server calculate every score.

This distinction should be represented in data rather than added later as an assumption.

```text
score_class = casual | verified
```

The first release writes only `casual` sessions.

## Identity design

The hosting platform already identifies the current ChatGPT user through trusted request headers. Identity must be read only in server-side code.

### Do not store

- ChatGPT password or tokens
- Raw authentication headers
- IP address
- Browser fingerprint
- User-agent history
- Precise location
- Unnecessary raw email in gameplay tables

### Internal user key

The available stable identity is the authenticated email header. Do not expose it as a database identifier. Normalize it server-side and derive a pseudonymous key:

```text
user_key = HMAC-SHA256(PROFILE_ID_SECRET, lowercase(trim(email)))
```

- `PROFILE_ID_SECRET` is a hosted secret, never committed.
- Only `user_key` is used as the foreign key in gameplay records.
- The email is not returned to the client unless it is needed for the account UI.
- Changing the HMAC secret would break account matching, so it must be backed up and treated as durable configuration.

The optional ChatGPT full-name header may be displayed during the request, but should not be persisted automatically. A player chooses the display name stored in the profile.

## Data model

### `profiles`

```text
user_key              TEXT PRIMARY KEY
display_name          TEXT NOT NULL
created_at            INTEGER NOT NULL
updated_at            INTEGER NOT NULL
last_seen_at          INTEGER NOT NULL
privacy_version       TEXT NOT NULL
profile_status        TEXT NOT NULL  -- active | deletion_pending
```

Rules:

- Display name length: 2–40 characters.
- Normalize surrounding whitespace.
- Disallow control characters and markup.
- Display names are not required to be unique while profiles are private.
- Never use display name for authorization.

### `game_sessions`

```text
id                    TEXT PRIMARY KEY
user_key              TEXT NOT NULL
collection_id         TEXT NOT NULL
score_class           TEXT NOT NULL  -- casual | verified
started_at            INTEGER NOT NULL
completed_at          INTEGER
status                TEXT NOT NULL  -- started | completed | abandoned
score                 INTEGER NOT NULL DEFAULT 0
maximum_score         INTEGER NOT NULL
correct_count         INTEGER NOT NULL DEFAULT 0
round_count           INTEGER NOT NULL
figures_revealed      INTEGER NOT NULL DEFAULT 0
FOREIGN KEY user_key REFERENCES profiles(user_key) ON DELETE CASCADE
```

### `round_attempts`

```text
id                    TEXT PRIMARY KEY
session_id            TEXT NOT NULL
paper_id              TEXT NOT NULL
question_type         TEXT NOT NULL
selected_option       INTEGER
was_correct           INTEGER NOT NULL
score_awarded         INTEGER NOT NULL
images_seen           INTEGER NOT NULL
answered_at           INTEGER NOT NULL
FOREIGN KEY session_id REFERENCES game_sessions(id) ON DELETE CASCADE
UNIQUE(session_id, paper_id)
```

### Indexes

```text
game_sessions(user_key, completed_at DESC)
game_sessions(user_key, status)
round_attempts(session_id)
round_attempts(paper_id)
```

Do not denormalize lifetime totals into `profiles` initially. Calculate them from completed sessions and attempts. With a small collection and early user base, this is simpler and avoids counters drifting out of sync.

## Statistics definitions

Use fixed, documented formulas:

```text
games_played       = completed sessions
best_score         = max(score) over completed sessions
total_score        = sum(score) over completed sessions
answers_given      = count(round_attempts in completed sessions)
correct_answers    = sum(was_correct)
accuracy           = correct_answers / answers_given
figures_revealed   = sum(max(images_seen - 1, 0))
papers_encountered = count(distinct paper_id)
```

Abandoned sessions do not contribute to profile statistics. They may be retained briefly for recovery and diagnostics, then removed.

## Server interfaces

All endpoints require a server-side authenticated user. Never trust a user key, email, score owner, or profile owner sent by the browser.

### Profile

```text
GET    /api/profile
PATCH  /api/profile
DELETE /api/profile
```

- `GET` creates a minimal profile when none exists and returns private statistics.
- `PATCH` accepts only a validated display name.
- `DELETE` removes the profile and cascades to every session and attempt.

### Game history

```text
POST /api/game-sessions
POST /api/game-sessions/:id/attempts
POST /api/game-sessions/:id/complete
GET  /api/game-sessions/recent
```

Authorization requirements:

- Resolve the current `user_key` from trusted headers for every request.
- Load the requested session and compare its stored owner to current `user_key`.
- Never accept ownership from request JSON.
- Reject attempts for completed sessions.
- Enforce one attempt per paper per session.
- Validate score and reveal values against allowed values.
- Make completion idempotent.

For the casual first release, the server validates ranges and session structure. It does not claim the score is cheat-proof.

## Game-flow integration

1. Player signs in through the hosting platform.
2. Home page offers **Play** and **My profile**.
3. Starting a game creates a `started` session.
4. Each submitted answer creates one attempt.
5. Revealing images affects `images_seen` and allowable score.
6. Completing the last round finalizes the session transactionally.
7. The results screen confirms that progress was saved.
8. The profile page shows updated totals and recent games.

### Failure behavior

- Gameplay remains usable if a statistics write temporarily fails.
- Failed writes show “Progress could not be saved” rather than false success.
- The client may retry an idempotent completion request.
- Never duplicate attempts or increment totals through retries.
- Do not cache authenticated profile responses publicly.

## Profile page

Route: `/profile`

### Header

- Display name
- “Private profile” label
- Edit-name control
- Sign-out link

### Summary cards

- Games played
- Best score
- Accuracy
- Papers encountered

### Supporting information

- Total score
- Correct answers
- Figures revealed
- Recent five completed games
- Score-class label: “Casual progress”

### Account controls

- Privacy explanation
- Delete my game data
- Sign out

Deletion requires an explicit confirmation step describing exactly what will be deleted. After deletion, redirect to the home page and do not silently recreate the profile until the user starts a new game or opens the profile again.

## Privacy policy additions

Explain in plain language:

- What is stored
- Why it is stored
- That profiles are private
- That scores are personal/casual
- That raw passwords and ChatGPT tokens are never received by the game
- That the user can delete all profile and gameplay records
- How long incomplete sessions are retained
- How to report an error

Recommended retention:

- Completed sessions: until the user deletes their data
- Started/abandoned sessions: 30 days
- Operational error logs: short-lived and without gameplay identity where possible

## Security and integrity checklist

- Read identity only from trusted server request headers.
- Derive `user_key` server-side.
- Use prepared statements.
- Check session ownership on every write and read.
- Validate display names and JSON payloads.
- Enforce database uniqueness and foreign keys.
- Use transactions or atomic batches for multi-record completion.
- Do not expose emails in page source or API responses unnecessarily.
- Add `Cache-Control: private, no-store` to user-specific responses.
- Do not place sensitive values in URLs.
- Rate-limit profile mutation and session creation where supported.
- Make account deletion complete and testable.

## Same-day implementation sequence

### Phase 1: Contract and schema

**Estimate:** 45–60 minutes

- Freeze the scope above.
- Add the D1 binding.
- Define tables and indexes.
- Generate and inspect the migration.

### Phase 2: Identity and data helpers

**Estimate:** 45–60 minutes

- Add the hosted HMAC secret.
- Resolve authenticated identity server-side.
- Create small prepared-statement helpers.
- Add profile creation and ownership checks.

### Phase 3: Profile and session APIs

**Estimate:** 90–120 minutes

- Implement profile read/update/delete.
- Implement session start, attempt, completion, and history.
- Make retries idempotent.
- Add private no-store response headers.

### Phase 4: Game integration

**Estimate:** 60–90 minutes

- Create a session on game start.
- Save each answer.
- Finalize completed games.
- Show saved/unsaved state honestly.

### Phase 5: Profile interface

**Estimate:** 60–90 minutes

- Add `/profile`.
- Add statistics and recent games.
- Add display-name editing.
- Add sign-out and deletion controls.

### Phase 6: Verification and private deployment

**Estimate:** 60–90 minutes

- Run schema, ownership, idempotency, deletion, and rendering tests.
- Test two distinct signed-in users for data isolation.
- Test temporary save failure.
- Deploy privately.

Expected focused implementation time: approximately 6–8 hours. A smaller profile containing only games played, best score, accuracy, and deletion can be delivered sooner.

## Acceptance criteria

- A signed-in player receives exactly one private profile.
- Returning players see persisted statistics.
- Completing a game updates statistics once, even after retrying.
- Abandoned games do not change completed-game statistics.
- One user cannot read or alter another user’s profile or sessions.
- No raw password, ChatGPT token, IP address, or browser fingerprint is stored.
- Raw email is not used as a gameplay-table identifier.
- The user can edit a valid display name.
- The user can delete the profile, sessions, and attempts completely.
- The UI distinguishes saved progress from failed persistence.
- Scores are labeled casual and are not presented as verified competition results.
- The site remains playable when profile persistence is temporarily unavailable.

## Later path to leaderboards

Before adding leaderboards:

1. Move paper selection and answer validation fully server-side.
2. Generate signed, expiring round identifiers.
3. Calculate scores on the server.
4. Prevent replay and duplicate submissions.
5. Add public-display-name consent.
6. Add moderation and reporting for public names.
7. Separate casual history from verified competitive sessions.
8. Define ties, resets, seasons, and deletion behavior.

The schema’s `score_class` field allows both systems to coexist without presenting today’s casual history as competitive evidence.
