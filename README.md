# Paper Picture

Paper Picture is a visual research game: players see progressively revealed figures from real computer-graphics and digital-geometry papers and guess an author affiliation, university, or country.

The live MVP uses a frozen, license-reviewed collection. It contains no fictional papers or institutions.

## Current release

- Production: <https://paperpicture.net>
- Access: public; profiles, saved games, and feedback still use ChatGPT identity
- Collection: `Open Graphics Collection 01 · v1.0`
- Content: 6 papers and 18 figures
- Figure rights: article-level CC BY 4.0 plus a figure-level credit check
- Profiles: private, ChatGPT-identified, pseudonymous in the gameplay database
- Feedback: authenticated submission plus an owner-only review and CSV-export inbox
- Hosting: OpenAI Sites with Cloudflare Workers-compatible vinext output and D1

The temporary Sites URL remains available as a fallback, but canonical metadata, the sitemap, and public documentation use `paperpicture.net`.

## What is implemented

- Progressive one-, two-, and three-figure reveal
- Institution and country questions with randomized paper order
- Server-recalculated scores: 100, 70, or 40 points for a correct answer
- Assisted-round marking when a player opens a figure source before answering
- Private profiles, saved game history, profile editing, and complete data deletion
- Rate limits and retention for incomplete sessions, feedback, and counters
- Feedback categories for gameplay, accessibility, metadata, privacy, bugs, and copyright
- Owner-only feedback triage with status filters and CSV export
- Rights evidence with asset hashes and a fail-closed playable collection
- Privacy notice, tester guide, canonical metadata, social preview, robots file, and sitemap
- Security headers, no-store authenticated responses, and private player data

## Technology

- Next.js-compatible app routes rendered by [vinext](https://github.com/cloudflare/vinext)
- React and TypeScript
- Cloudflare Workers runtime
- Cloudflare D1 with Drizzle schema and migrations
- OpenAI Sites hosting and Sign in with ChatGPT identity headers

## Local setup

Prerequisite: Node.js `>=22.13.0`.

```bash
npm install
npm run dev
```

Useful checks:

```bash
npm run build
node --test tests/rendered-html.test.mjs
npm run lint
```

Local authenticated/profile flows require runtime bindings that mirror production. The production-only values are managed by the hosting control plane and must not be committed.

Required runtime names:

- `DB`: D1 binding declared logically in `.openai/hosting.json`
- `PROFILE_ID_SECRET`: durable HMAC secret for deriving pseudonymous player keys
- `ADMIN_EMAIL`: owner identity allowed to review feedback

## Important project locations

- `app/`: pages, game UI, authenticated APIs, profile service, feedback inbox
- `data/papers.ts`: frozen playable paper and figure records
- `data/rights-evidence.json`: machine-readable source and asset-hash evidence
- `data/RIGHTS_AUDIT.md`: human-reviewed rights record
- `db/schema.ts`: application data model
- `drizzle/`: generated D1 migrations
- `public/papers/`: approved publisher-provided figures
- `tests/rendered-html.test.mjs`: release invariants and rights-hash checks

## Documentation

- [Current status and handoff](PROJECT_STATUS.md)
- [Prioritized roadmap](ROADMAP.md)
- [12 July 2026 work log](docs/WORKLOG_2026-07-12.md)
- [Operations and rollback](OPERATIONS.md)
- [Friend/public test checklist](PUBLIC_TEST_CHECKLIST.md)
- [Domain operations](DOMAIN_SETUP.md)
- [Rights audit](data/RIGHTS_AUDIT.md)
- [Repository and figure rights](LICENSE.md)

## Safety rules

- Never commit production database exports, player feedback, raw emails, runtime secrets, source-repository credentials, browser data, or registrar recovery codes.
- Do not alter the frozen collection in place. A paper, figure, answer, or scoring-content change requires a new collection ID and version.
- Do not add a figure without article-level license evidence, a figure-level third-party credit check, attribution, alternative text, and an updated asset hash.
- Keep player records, feedback exports, database snapshots, and hosted configuration out of the public repository.

This repository preserves source and operational knowledge. It is not a backup of private player data or hosted secrets.
