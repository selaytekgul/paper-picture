# Paper Picture roadmap

This roadmap starts from the production snapshot on 12 July 2026. The current site is healthy and owner-only.

## P0 — Before sending the link to a friend

1. **Choose the access model.**
   - For a friend outside the connected workspace, a public outer access policy is normally required.
   - Public outer access does not make private profiles public; saved profiles and feedback still use ChatGPT identity.
   - Do not change access implicitly. Record the decision and the intended tester count.
2. **Run one owner acceptance game on `paperpicture.net`.**
   - Complete all six rounds.
   - Exercise correct and incorrect answers and all three reveal levels.
   - Open a figure source and confirm the round/game is marked assisted.
   - Confirm the result appears in the private profile.
3. **Test the feedback loop.**
   - Submit feedback as a player.
   - Confirm it appears in `/admin/feedback` for the owner.
   - Change its status and export a CSV.
   - Store the export privately and delete it when no longer needed.
4. **Create a production D1 snapshot.**
   - Keep it outside GitHub.
   - Record its timestamp, collection ID, and deployed version in a private release record.
5. **Run the manual compatibility pass.**
   - Mobile and desktop
   - Chrome, Safari, and Firefox
   - Keyboard-only navigation
   - Reduced motion and basic screen-reader labels
6. **Send a short tester brief.**
   - Explain the progressive reveal and assisted-game label.
   - Ask the friend to report confusing images, wrong affiliations, accessibility issues, and rights concerns through the feedback form.

## P1 — First friend pilot

- Keep the pilot to 1–5 people for the first pass.
- Define a start/end date and a person responsible for feedback and takedowns.
- Review completion, save failures, assisted games, feedback categories, and ratings.
- Fix P0/P1 bugs without changing the frozen paper collection.
- Return to owner-only immediately for a material privacy, rights, or data-integrity issue.
- Write a short pilot outcome note: what players understood, where they hesitated, and whether the core guessing loop was enjoyable.

## P2 — Content expansion

- Build a candidate queue of 15–30 papers with explicit reusable figure licenses.
- Add venue/year/topic metadata while keeping license eligibility as the hard gate.
- Expand through new immutable collections, for example `open-graphics-02-v1`.
- Add double review for affiliation correctness, distractors, captions, alt text, and third-party material.
- Consider author-submitted figure packs with explicit permission and a standard contribution agreement.
- Candidate venues include SIGGRAPH/TOG, SIGGRAPH Asia, SGP, SPM, SMI, Eurographics, Pacific Graphics, 3DV, CVPR/ICCV/ECCV 3D tracks, CAD/Graphics, GMP, Shape Modeling, C&G, TVCG, CGF, The Visual Computer, Engineering with Computers, and SIAM geometry-related publications—but venue membership never substitutes for image rights.

## P3 — Product improvements

- Add collection, topic, year, venue, institution, and country modes.
- Add difficulty calibration using pilot answer/reveal data.
- Add a “paper of the day” or short three-round mode.
- Add clearer onboarding before the first round.
- Add a post-game learning view with topics, abstracts, and properly attributed paper links.
- Add opt-in achievements only after deciding whether they add educational value.
- Keep profiles private unless a separate moderation and consent design is approved.

## P4 — Reliability and governance

- Automate scheduled global retention cleanup.
- Establish recurring encrypted D1 backups and perform a restore drill.
- Add privacy-safe operational metrics and alerting for 5xx responses and save failures.
- Add a curator workflow that cannot publish an item without completed rights evidence.
- Add structured content review and collection-version migration tests.
- Document incident, takedown, correction, and contributor-response service levels.
- Review the privacy notice and data-processing posture before a wider public launch.

## Explicitly deferred

- Public leaderboards, prizes, or competitive rankings
- Independent passwords or custom identity storage
- Social profiles, messaging, comments, follows, and uploads
- Scraping figures from papers without explicit reuse rights
- Editing the current frozen collection in place

These require stronger answer secrecy, moderation, abuse prevention, consent, and governance than the current educational MVP.
