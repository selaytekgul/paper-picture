import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

test("homepage keeps the real open-graphics collection and profile entry points", async () => {
  const [page, layout] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
  ]);
  assert.match(layout, /Paper Picture — A visual research game/);
  assert.match(page, /Open Graphics Collection 01/);
  assert.match(page, /Play the real collection/);
  assert.match(page, /collectionPaperCount/);
  assert.match(page, /collectionFigureCount/);
  assert.match(page, /maximumCollectionScore/);
  assert.match(page, /CC BY 4\.0/);
  assert.match(page, /href="\/profile"/);
  assert.match(page, /href="\/privacy"/);
  assert.doesNotMatch(page, /fictional|prototype collection|codex-preview/i);
});

test("profiles are private, keyed, server-scored, and deletable", async () => {
  const [service, migration, profile, privacy] = await Promise.all([
    readFile(new URL("../app/profile-service.ts", import.meta.url), "utf8"),
    readFile(new URL("../drizzle/0000_fancy_orphan.sql", import.meta.url), "utf8"),
    readFile(new URL("../app/profile/profile-client.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/privacy/page.tsx", import.meta.url), "utf8"),
  ]);
  assert.match(service, /HMAC/);
  assert.match(service, /PROFILE_ID_SECRET/);
  assert.match(service, /selectedOption === paper\.correct/);
  assert.match(service, /pointsForImagesSeen\(imagesSeen\)/);
  assert.match(service, /Cache-Control": "private, no-store"/);
  assert.match(migration, /CREATE TABLE `profiles`/);
  assert.match(migration, /CREATE TABLE `game_sessions`/);
  assert.match(migration, /CREATE TABLE `round_attempts`/);
  assert.match(migration, /CREATE UNIQUE INDEX `round_attempts_session_paper_unique`/);
  assert.match(profile, /Delete all my data/);
  assert.match(privacy, /do not store your raw sign-in email or ChatGPT access tokens/);
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
  assert.match(data, /paper\.figures\.every\(\(figure\) => figure\.rightsStatus === "approved"\)/);
  assert.doesNotMatch(data, /Northbridge|Bellweather|Arcadia|fictional/i);

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
