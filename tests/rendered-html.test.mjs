import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

test("homepage keeps the real open-graphics collection and profile entry points", async () => {
  const [page, layout, data] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../data/papers.ts", import.meta.url), "utf8"),
  ]);
  assert.match(layout, /Paper Picture — A visual research game/);
  assert.match(data, /Open Graphics Collection 01/);
  assert.match(page, /Play the randomized collection/);
  assert.match(page, /collectionPaperCount/);
  assert.match(page, /collectionFigureCount/);
  assert.match(page, /maximumCollectionScore/);
  assert.match(page, /CC BY 4\.0/);
  assert.match(page, /href="\/profile"/);
  assert.match(page, /href="\/privacy"/);
  assert.doesNotMatch(page, /fictional|prototype collection|codex-preview/i);
});

test("profiles are private, keyed, server-scored, and deletable", async () => {
  const [service, initialMigration, hardeningMigration, profile, privacy, worker] = await Promise.all([
    readFile(new URL("../app/profile-service.ts", import.meta.url), "utf8"),
    readFile(new URL("../drizzle/0000_fancy_orphan.sql", import.meta.url), "utf8"),
    readFile(new URL("../drizzle/0001_cuddly_guardsmen.sql", import.meta.url), "utf8"),
    readFile(new URL("../app/profile/profile-client.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/privacy/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../worker/index.ts", import.meta.url), "utf8"),
  ]);
  assert.match(service, /HMAC/);
  assert.match(service, /PROFILE_ID_SECRET/);
  assert.match(service, /selectedOption === paper\.correct/);
  assert.match(service, /pointsForImagesSeen\(imagesSeen\)/);
  assert.match(service, /Cache-Control": "private, no-store"/);
  assert.match(initialMigration, /CREATE TABLE `profiles`/);
  assert.match(initialMigration, /CREATE TABLE `game_sessions`/);
  assert.match(initialMigration, /CREATE TABLE `round_attempts`/);
  assert.match(initialMigration, /CREATE UNIQUE INDEX `round_attempts_session_paper_unique`/);
  assert.match(hardeningMigration, /CREATE TABLE `feedback`/);
  assert.match(hardeningMigration, /CREATE TABLE `rate_limits`/);
  assert.match(hardeningMigration, /ADD `paper_order`/);
  assert.match(hardeningMigration, /ADD `assisted`/);
  assert.match(service, /shuffledPaperIds/);
  assert.match(service, /ABANDONED_SESSION_RETENTION = 7 \* DAY/);
  assert.match(service, /FEEDBACK_RETENTION = 365 \* DAY/);
  assert.match(service, /Too many requests/);
  assert.match(profile, /Delete all my data/);
  assert.match(privacy, /do not store your raw sign-in email or ChatGPT access tokens/);
  assert.match(worker, /Content-Security-Policy/);
  assert.match(worker, /X-Content-Type-Options/);
});

test("ships only approved paper records and all eighteen image assets", async () => {
  const data = await readFile(new URL("../data/papers.ts", import.meta.url), "utf8");
  assert.match(data, /id: "goal-adaptive-meshing"/);
  assert.match(data, /id: "functional-maps-morphing"/);
  assert.match(data, /id: "topology-aerodynamic"/);
  assert.match(data, /id: "mesh-assimilation"/);
  assert.match(data, /id: "tubular-hex-meshing"/);
  assert.match(data, /id: "cadgcl-retrieval"/);
  assert.equal((data.match(/licenseUrl: ccBy/g) ?? []).length, 18);
  assert.equal((data.match(/src: "\/papers\//g) ?? []).length, 18);
  assert.match(data, /maximumCollectionScore = collectionPaperCount \* 100/);
  assert.match(data, /pointsForImagesSeen/);
  assert.match(data, /open-graphics-01-v1/);
  assert.match(data, /paper\.figures\.every\(\(figure\) => figure\.rightsStatus === "approved"\)/);
  assert.doesNotMatch(data, /Northbridge|Bellweather|Arcadia|fictional/i);
  const answerPositions = [...data.matchAll(/correct: ([0-3])/g)].map((match) => Number(match[1]));
  assert.equal(answerPositions.length, 6);
  assert.ok(new Set(answerPositions).size >= 4);

  await Promise.all([
    "goal-adaptive/fig11.png",
    "goal-adaptive/fig15.png",
    "goal-adaptive/fig13.jpg",
    "functional-maps/fig3.png",
    "functional-maps/fig6.png",
    "functional-maps/fig4.png",
    "topology-aero/fig2.png",
    "topology-aero/fig28.png",
    "topology-aero/fig26.png",
    "mesh-assimilation/fig1.jpg",
    "mesh-assimilation/fig9.png",
    "mesh-assimilation/fig13.png",
    "tubular-hex/fig19.png",
    "tubular-hex/fig20.png",
    "tubular-hex/fig21.png",
    "cadgcl/fig1.png",
    "cadgcl/fig2.png",
    "cadgcl/fig4.png",
  ].map((file) => access(new URL(`../public/papers/${file}`, import.meta.url))));
});

test("rights evidence matches every shipped publisher asset", async () => {
  const evidence = JSON.parse(await readFile(new URL("../data/rights-evidence.json", import.meta.url), "utf8"));
  assert.equal(evidence.collectionId, "open-graphics-01-v1");
  assert.equal(evidence.papers.length, 6);
  const figures = evidence.papers.flatMap((paper) => paper.figures);
  assert.equal(figures.length, 18);
  for (const figure of figures) {
    const bytes = await readFile(new URL(`../${figure.path}`, import.meta.url));
    assert.equal(createHash("sha256").update(bytes).digest("hex"), figure.sha256, figure.path);
  }
});
