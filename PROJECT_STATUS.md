# Paper Picture project status

Snapshot date: **13 July 2026**

## Production coordinates

| Item | State |
| --- | --- |
| Primary URL | <https://paperpicture.net> |
| Custom domain and HTTPS | Active |
| Hosting | OpenAI Sites |
| Source | <https://github.com/selaytekgul/paper-picture> |
| Access policy | Public anonymous play; identity required only for private data features |
| Health check | `/api/health` reports collection IDs and public counts only |
| Search files | `/robots.txt` and `/sitemap.xml` |
| Canonical host | `https://paperpicture.net` |
| Current Sites version | 17 · source commit `9942887` |

The Sites control plane retains saved deployment versions. Production version 16 is also marked by the pushed annotated Git tag `production-v16-2026-07-13`, providing an explicit rollback baseline before the plain-UX release. Source commits in GitHub are the release record for application code; the private D1 backup is deliberately stored outside GitHub.

## Immutable content releases

| Collection | Frozen | Papers | Figures | Evidence |
| --- | --- | ---: | ---: | --- |
| `open-graphics-01-v1` / `1.0` | 12 July 2026 | 6 | 18 | `data/rights-evidence.json`, `data/RIGHTS_AUDIT.md` |
| `open-graphics-02-v1` / `1.0` | 13 July 2026 | 6 | 18 | `data/rights-evidence-02.json`, `data/RIGHTS_AUDIT_02.md` |

Every collection has a maximum score of 600. All 36 shipped figure hashes are recomputed by the release test. Collection 01 was not modified when Collection 02 was introduced.

## Current product surfaces

- Plain, game-first landing flow: one-sentence purpose, collection choice, guess-type choice, and one primary start action
- Compact three-step explanation, with research-selection and licensing details available without competing with play
- Collection picker and six game modes: institution, country, author, venue, year, and topic
- Progressive reveal, assisted-round classification, scoring, and complete attribution
- DOI-based result links to the corresponding Paperlog page, with the publication DOI retained separately
- Anonymous play with a clear, non-blocking saved-history fallback
- Optional ChatGPT, Google, and GitHub sign-in with a provider-neutral private profile per verified email
- Server-owned authenticated sessions, attempts, completion, and score calculation
- Private player profile, history, editing, and complete data deletion
- Authenticated feedback/contact form and owner-only inbox with status management and CSV export
- Owner-only seven-day operational dashboard using aggregate hourly counters
- Owner-only production backup export with client-side manifest and six-table verification
- Privacy notice, tester guide, canonical metadata, social preview, security headers, robots file, and sitemap

## Data model and retention

Production D1 contains:

- `profiles`
- `game_sessions`
- `round_attempts`
- `feedback`
- `rate_limits`
- `operational_metrics`

Retention implemented in application code:

- Incomplete sessions: 7 days
- Feedback: 365 days
- Rate-limit counters: approximately 2 days
- Aggregate operational counters: 90 days
- Completed sessions and profiles: until player deletion

Player identity is `HMAC-SHA256(PROFILE_ID_SECRET, normalized verified email)`. ChatGPT uses native Sites identity headers; Google and GitHub use portable Auth.js OAuth routes and a secured site session. Gameplay tables do not store raw sign-in email, authentication tokens, IP address, or browser fingerprint. Operational counters store only an event name, hourly bucket, and count.

## Release evidence completed

- Production version 17 was checked on the custom domain at desktop and 390 × 844: no horizontal overflow, four answer choices, correct-answer reveal, score update, and DOI-specific Paperlog link all passed.
- The version 17 homepage has a refreshed repository screenshot and a dedicated social preview using the simpler product message.
- A fresh private production backup was exported from version 16 on 13 July, verified to contain both collection descriptors and all six application tables, and stored outside the repository with owner-only filesystem permissions.
- Existing owner feedback was reviewed; no release-blocking product report was present.
- Production build, lint, TypeScript, whitespace checks, and ten automated release tests pass.
- All 12 shipped DOI links redirect through production Paperlog to the expected canonical paper pages; both redirect and destination return successfully.
- Google and GitHub production sign-in, callback, profile loading, and sign-out were exercised successfully on `paperpicture.net`.
- Google and ChatGPT returned the same verified owner email and reached the existing profile. GitHub returned a different verified email and correctly remained a separate private profile.
- All 36 rights-evidence checksums match the shipped figure files.
- A complete anonymous country-mode game passed, including a second-figure reveal and final scoring.
- Owner acceptance confirmed saved history for both collections, incorrect and third-reveal assisted states, feedback status management and CSV export, aggregate metrics, and the verified backup workflow.
- The collection/mode picker and full landing page were visually checked at a 390-pixel mobile viewport.
- Native controls expose button, pressed, progress, status, heading, link, and fieldset semantics; visible focus and reduced-motion styles are present.

## Hosted configuration absent from Git

- `PROFILE_ID_SECRET` and `ADMIN_EMAIL` values
- `AUTH_SECRET` and Google/GitHub OAuth client credentials
- Physical D1 database identifier and database contents
- Hosting source-write credentials and owner bypass tokens
- Registrar password, recovery information, and browser session
- Private exports, tester identities, and feedback text

Preserve the HMAC secret outside Git: replacing it would disconnect existing profiles from their identities.

## Known limitations

- Each collection is intentionally small and selected for reusable figure rights, not venue completeness.
- Scores support casual personal progress, not prizes or high-integrity competition.
- Correct answers exist in browser-delivered content, so determined players can inspect them.
- Retention cleanup is request-driven rather than a scheduled global job.
- Safari, Firefox, screen-reader, and restore-drill acceptance still require owner-operated checks.
- Aggregate monitoring is descriptive; it does not yet send alerts.
- Google authentication works in production, but Google consent-branding verification remains pending; until verification, Google may display the domain rather than the Paper Picture brand name.

## Handoff rule

Before a production change, read `OPERATIONS.md`, `PUBLIC_TEST_CHECKLIST.md`, and `LICENSE.md`. For content changes, read both rights audits and create a new immutable collection rather than editing either current release.
