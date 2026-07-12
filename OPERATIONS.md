# Paper Picture operations

## Production coordinates

- Primary URL: `https://paperpicture.net`
- Health: `https://paperpicture.net/api/health`
- Feedback inbox: `https://paperpicture.net/admin/feedback`
- Current collection: `open-graphics-01-v1` / version `1.0`
- Current deployed site version at the 12 July handoff: 9
- Access: public; private application routes remain identity-protected

The GitHub repository backs up source and documentation only. It does not back up D1 data, hosted environment values, authentication configuration, or registrar access.

## Release model

- The playable set is frozen as `open-graphics-01-v1`, version `1.0`.
- Any paper, question, answer, or figure change creates a new collection ID and version. Historical sessions retain their original ID, maximum score, paper order, and score class.
- Deploy privately first. Change access only after a successful private acceptance pass and an explicit audience decision.

## Data lifecycle

- Abandoned sessions: automatically deleted after 7 days when that player next uses the site.
- Feedback: automatically deleted after 365 days when that player next uses the site.
- Rate-limit counters: automatically deleted after approximately 2 days.
- Completed sessions and profiles: retained until the player deletes the profile.
- Profile deletion explicitly removes feedback, rate limits, attempts, sessions, and the profile.

## Backup before a public-test release

1. Export or snapshot the production D1 database using the Sites/Cloudflare control plane available to the site owner.
2. Record the snapshot timestamp, deployed collection ID, and saved site version in the release record.
3. Verify that the export contains `profiles`, `game_sessions`, `round_attempts`, `feedback`, and `rate_limits`.
4. Store the export in an owner-controlled location; it contains private player data and must not be committed to the repository.

## Rollback

1. Stop inviting new testers and return access to owner-only if the issue affects privacy, rights, or data integrity.
2. Redeploy the last known-good saved Sites version.
3. If a schema rollback is required, restore the matching D1 snapshot rather than manually deleting columns or records.
4. Confirm profile access, one complete game, feedback submission, and deletion before reopening access.

## Monitoring and incident response

- Application errors are emitted as structured events without raw email addresses or submitted feedback text.
- The configured owner can review, filter, resolve, and export submitted feedback at `/admin/feedback`. This route and its API return 404 for signed-in non-admin users.
- A lightweight release check is available at `/api/health`; it exposes collection counts only and never queries player data.
- Investigate repeated 429 responses, 5xx responses, failed migrations, incomplete deployments, and rights/takedown feedback.
- For a copyright or privacy report, temporarily remove the affected paper or return the site to owner-only while reviewing evidence.
- Never paste production database rows, identity secrets, source credentials, or private feedback into public issues.

## Release acceptance

- Build and automated tests pass.
- The migration archive contains every generated migration.
- Rights evidence hashes match all shipped figures.
- Desktop, mobile, keyboard, correct-answer, incorrect-answer, reveal, assisted, save, feedback, retention, and delete paths pass.
- The production deployment remains private until tester access is explicitly configured.

## Domain launch

`paperpicture.net` is attached, publicly resolved, and protected by a valid managed certificate. For a future domain change:

1. Attach the new hostname and use only the routing/validation records returned for that attachment.
2. Keep the old hostname active until the new route, certificate, canonical metadata, and acceptance checks pass.
3. Follow `DOMAIN_SETUP.md` and update `PROJECT_STATUS.md` after the change.
