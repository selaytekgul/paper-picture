# Paper Picture project status

Snapshot date: **12 July 2026**

## Production state

| Item | State |
| --- | --- |
| Primary URL | <https://paperpicture.net> |
| Custom domain | Active |
| Managed HTTPS | Active; certificate covers `paperpicture.net` |
| Registrar DNS | METUnic `ns1.metunic.com.tr` and `ns2.metunic.com.tr` |
| Hosting | OpenAI Sites |
| Deployed site version | 9 |
| Source commit deployed | `4b173ae58553b2c48c58ae9053d19caf39a289ed` |
| Access policy | Owner-only/custom; no groups |
| Health check | `/api/health` returns 200 and the frozen collection counts |
| Search files | `/robots.txt` and `/sitemap.xml` return 200 |
| Canonical host | `https://paperpicture.net` |

The outer production gate intentionally returns an authentication response to unapproved visitors. Do not interpret that as downtime. The application and custom domain were verified through the owner bypass on 12 July 2026.

## Frozen content release

- Collection ID: `open-graphics-01-v1`
- Version: `1.0`
- Label: `Open Graphics Collection 01 · v1.0`
- Frozen: 12 July 2026
- Papers: 6
- Figures: 18
- Maximum unassisted score: 600
- Rights rule: explicit CC BY 4.0 article coverage, no separate third-party credit on the selected figure, verified affiliation, complete attribution

The paper list and exact evidence are in `data/papers.ts`, `data/rights-evidence.json`, and `data/RIGHTS_AUDIT.md`. The automated test recomputes all 18 asset hashes.

## Complete product surfaces

- Home/game route with progressive reveal and randomized paper order
- Server-owned game sessions, attempts, completion, and score calculation
- Assisted-game classification
- Private player profile and recent history
- Display-name edit and full profile/data deletion
- Authenticated feedback/contact form
- Owner-only feedback inbox at `/admin/feedback`
- Feedback status management and CSV export
- Privacy notice and tester guide
- Health endpoint containing no player data
- Search metadata and social preview image
- Security and privacy response headers

## Data model and retention

Production D1 contains these application tables:

- `profiles`
- `game_sessions`
- `round_attempts`
- `feedback`
- `rate_limits`

Retention implemented in application code:

- Incomplete sessions: 7 days
- Feedback: 365 days
- Rate-limit counters: approximately 2 days
- Completed sessions/profile: until the player deletes the profile

Player identity is derived with `HMAC-SHA256(PROFILE_ID_SECRET, normalized email)`. Raw sign-in email, authentication tokens, IP address, and browser fingerprints are not stored in gameplay tables.

## Hosted configuration that is deliberately absent from Git

- The value of `PROFILE_ID_SECRET`
- The value of `ADMIN_EMAIL`
- The physical D1 database identifier and database contents
- Hosting source-write credentials and owner bypass tokens
- METUnic password, recovery information, and browser session

Only configuration names and the logical `DB` binding belong in source control. Preserve the HMAC secret outside Git; changing it would disconnect existing profiles from their identities.

## Validation completed for this snapshot

- Production build succeeded.
- Six automated release tests passed.
- All 18 rights-evidence hashes matched the shipped images.
- Git diff whitespace validation passed.
- DNS A and TXT records resolved publicly.
- Hosting reported domain, provider route, and SSL states as active.
- HTTPS certificate and custom hostname were verified.
- Production health, robots, and sitemap routes returned HTTP 200.

## Known limitations

- The six-paper collection is intentionally small.
- Scores are suitable for casual personal progress, not competitions or prizes.
- The correct answer exists in browser-delivered game data, so cheating is possible.
- Retention cleanup runs when the affected player next uses the site; it is not yet a global scheduled purge.
- There is no automated production database backup or restore drill recorded yet.
- Cross-browser, mobile, keyboard-only, reduced-motion, and screen-reader acceptance still need a documented manual pass.
- No analytics dashboard exists; feedback and D1 queries are the current pilot signals.
- Access is still owner-only, so a friend cannot enter until the owner explicitly chooses public access or an eligible tester allowlist.

## Safe handoff rule

Before changing production, read `ROADMAP.md`, `OPERATIONS.md`, and `PUBLIC_TEST_CHECKLIST.md`. For any content change, read `data/RIGHTS_AUDIT.md` and create a new collection version rather than editing `open-graphics-01-v1` in place.
