# Paper Picture roadmap

This roadmap starts from the two-collection release prepared on 13 July 2026. The website and portfolio repository are public; profiles and feedback remain private.

## Completed foundation

- Custom domain, managed HTTPS, canonical metadata, robots, and sitemap
- Two immutable, rights-reviewed collections with 12 papers and 36 figures
- Six modes: institution, country, author, venue, year, and topic
- Anonymous play plus optional private profiles and server-verified saved games
- Feedback/contact flow and owner triage/CSV inbox
- Private production backup export and one verified snapshot
- Aggregate-only owner metrics for starts, completions, attempts, feedback, deletion, and server errors
- Public repository showcase, architecture, rights records, runbook, and worklogs

## P0 — First friend pilot

1. Send <https://paperpicture.net> to 1–5 friends with a short test brief.
2. Ask each tester to try a different collection and mode, reveal at least one extra figure, and use the feedback form.
3. Privately record test dates and contact details; do not put names or feedback text in GitHub.
4. Review the owner dashboard after the pilot and distinguish product problems from expected anonymous save failures.
5. Fix release-blocking accessibility, factual, rights, privacy, or data-loss issues immediately.
6. Write a short anonymized outcome note: what players understood, where they hesitated, and whether the loop was enjoyable.

## P1 — Compatibility and operations

- Run owner acceptance in Safari and Firefox.
- Complete a screen-reader pass for setup, round, reveal, answer, and result states.
- Verify authenticated save, profile history, feedback, status update, export, and profile deletion after this schema release.
- Establish encrypted recurring D1 backups and perform a documented restore drill.
- Add alerting only after enough aggregate traffic exists to define a meaningful error or completion baseline.
- Move retention cleanup to a scheduled global job.

## P2 — Content expansion

- Build a rights-first candidate queue across SGP, SPM, SMI, Eurographics, Pacific Graphics, SIGGRAPH/TOG, SIGGRAPH Asia, CAD/Graphics, GMP, C&G, TVCG, CGF, The Visual Computer, Engineering with Computers, and related geometry venues.
- Treat venue membership only as discovery; explicit reusable figure rights remain the hard gate.
- Add double review for affiliation, answer wording, distractors, captions, alternative text, and third-party material.
- Consider author-submitted figure packs with explicit permission and a standard contribution agreement.
- Publish all additions as new immutable collection versions.

## P3 — Game depth

- Add a short three-round mode and paper-of-the-day experience.
- Calibrate difficulty from aggregate reveal/completion patterns and tester feedback.
- Add a post-game learning view with abstracts or short curator summaries and attributed links.
- Consider opt-in achievements only if they improve learning.
- Improve answer secrecy before any competitive feature.

## Governance before wider promotion

- Curator workflow that cannot publish incomplete rights evidence
- Incident, takedown, correction, and contributor-response targets
- Privacy and data-processing review
- Accessibility acceptance record
- Tested backup restoration and owner succession notes

## Explicitly deferred

- Public leaderboards, prizes, or high-stakes rankings
- Public player profiles, comments, messaging, follows, or uploads
- Independent passwords or custom authentication storage
- Scraping figures without explicit reuse rights
- Editing a frozen collection in place

These require stronger answer security, moderation, abuse prevention, consent, or governance than the present educational release.
