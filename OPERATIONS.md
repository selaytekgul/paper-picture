# Paper Picture operations

## Production coordinates

- Primary URL: `https://paperpicture.net`
- Health: `https://paperpicture.net/api/health`
- Feedback and metrics dashboard: `https://paperpicture.net/admin/feedback`
- Private backup export: `https://paperpicture.net/api/admin/backup`
- Source: `https://github.com/selaytekgul/paper-picture`
- Access: public anonymous play; private routes remain identity-protected

GitHub backs up source and documentation only. It is not a backup of D1 data, hosted environment values, authentication configuration, or registrar access.

## Release model

- Collections are immutable after publication.
- Any paper, figure, answer metadata, or scoring-content change creates a new collection ID and version.
- Historical sessions keep their collection ID, version, mode, maximum score, paper order, and score class.
- A schema migration and its matching source commit ship together.

## Data lifecycle

- Abandoned sessions: removed after 7 days when that player next uses the site.
- Feedback: removed after 365 days when that player next uses the site.
- Rate-limit counters: removed after approximately 2 days.
- Aggregate event counters: removed after 90 days.
- Completed sessions and profiles: retained until the player deletes the profile.
- Profile deletion removes the player’s feedback, rate limits, attempts, sessions, and profile.

## Private backup procedure

1. Sign in as the configured owner.
2. Export `/api/admin/backup` before a schema or public-test release.
3. Verify the export format, timestamp, collection list, and presence of all six application tables.
4. Store the file in an owner-controlled location outside the repository; restrict it to the owner account.
5. Record only the timestamp and successful verification in public release notes—never row contents, feedback text, user keys, or the private filesystem path.
6. Delete temporary browser/download copies after the protected copy is verified.

The 13 July release backup was completed and stored privately. A restore drill remains a roadmap item.

## Monitoring and incident response

- `/api/health` exposes only public collection IDs, versions, and counts.
- `/admin/feedback` shows the owner seven-day totals for starts, completions, saved answers, feedback, deletion, and server errors.
- Monitoring rows contain only `metric`, hourly `bucket_start`, and `count`; no user identifier, IP, URL, or message text.
- Expected validation and authentication responses are not counted as server errors.
- Investigate unexpected 5xx responses, failed migrations, incomplete deployments, a sharp completion-rate drop, and rights/takedown feedback.
- Never paste production rows, feedback text, secrets, credentials, or private exports into public issues.

For a material privacy, rights, or data-integrity incident, stop invitations, restrict access if necessary, preserve relevant private evidence, and return to the last known-good deployment while investigating.

## Rollback

1. Select the last known-good saved Sites version.
2. If the issue involves a schema rollback, restore the matching private D1 backup rather than manually deleting columns or rows.
3. Verify the home page, health endpoint, one anonymous game, an owner profile, feedback, and the admin dashboard.
4. Reopen access only after the incident and data state are understood.

## Release acceptance

- `npm test`, `npm run lint`, and `git diff --check` pass.
- Generated migrations and schema agree.
- Rights evidence hashes match every shipped figure.
- Anonymous and authenticated game paths pass.
- Correct, incorrect, reveal, assisted, completion, profile, feedback, owner, retention, and deletion paths are checked in proportion to the change.
- Desktop, mobile, keyboard, and reduced-motion checks pass; record any browser or assistive-technology gaps.
- Production health, robots, sitemap, canonical URL, HTTPS, and custom domain pass after deployment.

## Domain operations

`paperpicture.net` is attached and protected by a managed certificate. For a future hostname change, keep the old hostname active until routing, certificate, canonical metadata, and acceptance checks pass, then update `DOMAIN_SETUP.md` and this runbook.
