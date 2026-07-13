# Public test checklist

## Release infrastructure

- [x] Two separately versioned, rights-reviewed collections are frozen.
- [x] Six game modes are available.
- [x] Anonymous play, optional profiles, saved games, deletion, feedback, owner inbox, and aggregate monitoring are implemented.
- [x] `paperpicture.net` DNS, HTTPS, canonical metadata, robots, and sitemap are active.
- [x] Public outer access is enabled; private data routes accept only a verified supported identity.
- [x] A production backup was exported and stored privately outside GitHub.

## Automated acceptance

- [x] Production build passes.
- [x] Nine release tests pass.
- [x] All 36 image checksums match both rights archives.
- [x] Lint, TypeScript, and whitespace checks pass.
- [x] Health output contains public collection data only.
- [x] Metrics endpoint is owner-only and aggregate-only.

## Browser acceptance completed

- [x] Select Collection 02 and country mode.
- [x] Complete all six anonymous rounds.
- [x] Reveal a second figure and receive 70 points for that round.
- [x] See paper, author, affiliation, venue, year, DOI, source, and license after answering.
- [x] Reach the final result state at 570/600 and see the anonymous-save explanation.
- [x] Inspect the complete landing/setup page at 390 × 844.
- [x] Confirm responsive one-column pickers, readable labels, visible focus styles, and reduced-motion CSS.
- [x] Complete production Google and GitHub authorization callbacks and provider-aware sign-out.

## Owner acceptance after deployment

- [x] Complete production sign-in with Google and GitHub; retain the existing native ChatGPT path.
- [x] Confirm matching verified emails reach the same private profile, different verified emails remain isolated, and sign-out clears the selected provider session.
- [ ] Save one game in each collection and confirm mode labels in private history.
- [ ] Exercise an incorrect answer, third-figure reveal, and assisted source-open state.
- [ ] Submit one new feedback item, change its status, and privately export the CSV.
- [ ] Confirm the seven-day owner totals load without player identifiers.
- [ ] Delete a disposable test profile and verify related data is removed.
- [ ] Confirm the backup endpoint still includes all six tables after migration.

## Compatibility still to record

- [ ] Safari desktop/mobile
- [ ] Firefox desktop
- [ ] Keyboard-only complete game in a physical browser session
- [ ] Reduced-motion operating-system setting
- [ ] VoiceOver or another screen reader

## Search discovery

- [x] Canonical URL, crawlable robots file, and sitemap are public.
- [x] Paper Picture favicon, Apple touch icon, manifest icons, descriptive metadata, and WebSite structured data are deployed.
- [ ] Add `paperpicture.net` as a Google Search Console domain property.
- [ ] Submit `https://paperpicture.net/sitemap.xml` in Search Console.
- [ ] Inspect `https://paperpicture.net/` and request indexing once after verification.
- [ ] Complete Google OAuth consent-branding verification after domain ownership is available in Search Console.

## Friend pilot brief

- [ ] Invite 1–5 friends for the first pass.
- [ ] Privately record test dates and contacts.
- [ ] Ask testers to try different collection/mode combinations.
- [ ] Ask about confusing figures, answer wording, affiliation accuracy, accessibility, privacy, and rights concerns.
- [ ] Review aggregate starts/completions and owner feedback after the test window.
- [ ] Publish only anonymized findings.

## Success gate

- Players can enter and finish without explanation.
- Saved games work when a player chooses to sign in.
- Metadata and attribution corrections are resolved.
- No unresolved critical accessibility, privacy, copyright, or data-loss issue remains.
- A tested private backup can be restored.
- The owner explicitly approves audience expansion.
