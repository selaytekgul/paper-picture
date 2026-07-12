# Paper Picture: License-First Real MVP Plan

## Goal

Serve a playable MVP using only real computer-graphics or digital-geometry papers. No fictional papers, authors, institutions, or figures may remain in the released collection.

The first collection will be selected by **license first**, not by conference. Its working title is:

> Open Graphics Collection 01

## Same-day MVP scope

- 3 real papers required; 5 preferred
- 2 usable figures per paper
- Institution and institution-country questions
- 3–5 rounds per game
- Progressive reveal using distinct figures from the same paper
- Complete paper citation, source, license, and modification notice
- Anonymous play
- Existing served interface reused

Accounts, leaderboards, research-group questions, author submissions, and broad venue coverage remain deferred.

## Eligible licenses

### Accept for this MVP

- CC BY 4.0
- CC BY 3.0
- CC BY-SA 4.0, only if the adapted game image and attribution workflow comply with ShareAlike
- Public domain or CC0

### Exclude for this MVP

- Standard arXiv distribution license
- No license or unclear license
- CC BY-ND and CC BY-NC-ND, because game preparation may involve cropping or modification
- CC BY-NC unless the project is formally kept noncommercial and the use is reviewed
- Publisher pages that are merely free to read
- Author project pages without explicit reuse permission

CC BY permits sharing and adaptation with attribution, a license link, and an indication of changes. It does not automatically cover third-party material embedded in a paper.

## Candidate sources

Search in this order:

1. Recent arXiv computer-graphics, geometry, rendering, animation, and 3D-vision papers whose **individual arXiv record explicitly states CC BY**.
2. Fully open-access journal articles whose individual article page and PDF explicitly state CC BY.
3. CC0/public-domain technical reports with usable scientific figures.

Do not treat a journal-wide statement, repository access, or downloadable PDF as sufficient without confirming the individual paper's license.

## Phase 1: Freeze eligibility rules

**Timebox:** 30 minutes

- Limit the collection to papers published from 2023–2026.
- Prefer geometry processing, shape modeling, rendering, animation, fabrication, and 3D reconstruction.
- Exclude figures containing third-party photographs, copyrighted characters, branded products, unlicensed datasets, or identifiable people.
- Require explicit article-level license evidence and a figure-level third-party-material check.
- Define attribution and modification wording.

**Exit condition:** A candidate can be accepted or rejected using a fixed checklist.

## Phase 2: Build the candidate pool

**Timebox:** 90 minutes

- Find 12–15 real candidate papers.
- Record title, URL, authors, year, subject, explicit license URL, project URL, and available affiliations.
- Inspect their figures for visual-game suitability.
- Rank candidates by license clarity, figure quality, affiliation clarity, and question quality.

**Exit condition:** At least six candidates have explicit acceptable licenses and potentially usable figures.

## Phase 3: Verify papers and figures

**Timebox:** 90 minutes

For each priority candidate:

- Confirm the license on the individual record and PDF.
- Check captions and acknowledgements for third-party assets.
- Verify title and author order.
- Verify affiliations from the paper itself.
- Normalize the institution name and country.
- Reject ambiguous multi-affiliation questions unless a specific author can be named.
- Retain a screenshot or archival record of the license evidence.

**Exit condition:** Three papers are fully approved; five are preferred.

## Phase 4: Prepare licensed figures and questions

**Timebox:** 90 minutes

- Select two distinct figures per approved paper.
- Preserve the original source image.
- Create a web-ready version only where the license permits adaptation.
- Record whether it was cropped, resized, or had identifying text removed.
- Add alternative text.
- Construct one unambiguous institution or country question per paper.
- Create plausible distractors that are not also contributors.
- Add a complete attribution shown immediately after the answer.

**Required attribution record**

```text
Paper title
Authors
Figure number
Original paper URL
Creator/rightsholder
License name and URL
Modifications made
Third-party-material check
Reviewer and review date
```

## Phase 5: Replace fictional content

**Timebox:** 90 minutes

- Remove all fictional paper records from the playable collection.
- Import the approved real papers.
- Add paper, author, affiliation, license, and image-source fields.
- Display citation, license, and modification notices on the answer screen.
- Change the site wording from `SIGGRAPH 2025 prototype` to `Open Graphics Collection 01`.
- Ensure the application fails closed: an image without approved rights status cannot be displayed.

**Exit condition:** Every playable round refers to a verified real paper and approved real figure.

## Phase 6: Test and publish

**Timebox:** 60 minutes

- Complete every question on desktop and mobile layouts.
- Confirm exactly one correct answer per round.
- Confirm no image reveals the answer unintentionally.
- Follow every paper and license link.
- Review every attribution against its source.
- Remove any doubtful paper rather than delaying or weakening the standard.
- Build and publish the updated served website.

**Exit condition:** A visitor can complete a 3–5 round game containing no fictional or unresolved content.

## Hard launch gate

A paper may enter the game only when all are true:

```text
real_paper
AND article_license_verified
AND figure_rights_verified
AND third_party_material_cleared
AND metadata_verified
AND affiliation_verified
AND question_reviewed
AND attribution_complete
```

## If fewer than three papers pass

Do not restore fictional content or weaken the license rules. Publish a smaller real collection only if it remains meaningfully playable; otherwise keep the existing prototype private and continue candidate discovery.

## After the same-day MVP

- Expand to 10–20 CC-licensed papers.
- Add a curator interface and persistent database.
- Add venue/year/topic filters.
- Invite authors to submit licensed figures.
- Add SIGGRAPH papers later only after explicit permission.
