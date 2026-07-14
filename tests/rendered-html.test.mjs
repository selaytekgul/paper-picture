import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { access, readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

async function importTypeScriptModule(relativePath) {
  const source = await readFile(new URL(relativePath, import.meta.url), "utf8");
  const compiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  return import(`data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`);
}

test("homepage keeps Collection 01 frozen and exposes Collection 02 plus six game modes", async () => {
  const [page, layout, about, data, data02] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/about/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../data/papers.ts", import.meta.url), "utf8"),
    readFile(new URL("../data/open-graphics-02.ts", import.meta.url), "utf8"),
  ]);
  assert.match(layout, /Paper Picture — Computer Graphics Research Paper Guessing Game/);
  assert.match(layout, /google: "78qGk-ze1JLFwz5RwmTtF18NIdzJspt3G1guOlfjQYg"/);
  assert.match(data, /Open Graphics Collection 01/);
  assert.match(data02, /Open Graphics Collection 02/);
  assert.match(page, /Set up your game/);
  assert.match(page, /What do you want to guess\?/);
  assert.match(page, /Start the game/);
  assert.match(page, /No sign-in needed/);
  assert.match(page, /collectionCatalog/);
  assert.match(page, /gameModes/);
  assert.match(page, /buildRoundQuestion/);
  assert.match(page, /gameMode === "topic" \? "Research figure" : paper\.topic/);
  assert.match(page, /CC BY 4\.0/);
  assert.match(page, /href="\/profile"/);
  assert.match(page, /href="\/privacy"/);
  assert.match(page, /href="\/terms"/);
  assert.match(page, /href="\/about"/);
  assert.match(about, /Why Paper Picture exists/);
  assert.match(about, /paperlog\.net/);
  assert.doesNotMatch(page, /Choose what to investigate|Build your round|Real papers\. Traceable figures|fictional|prototype collection|codex-preview/i);
  assert.match(layout, /og-simple\.png/);
  await access(new URL("../public/og-simple.png", import.meta.url));
});

test("links every shipped paper to Paperlog by DOI while retaining the publication DOI", async () => {
  const [page, data, data02, links] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../data/papers.ts", import.meta.url), "utf8"),
    readFile(new URL("../data/open-graphics-02.ts", import.meta.url), "utf8"),
    importTypeScriptModule("../data/paper-links.ts"),
  ]);
  const dois = [...data.matchAll(/doi: "([^"]+)"/g), ...data02.matchAll(/doi: "([^"]+)"/g)].map((match) => match[1]);
  assert.equal(dois.length, 12);
  assert.equal(new Set(dois).size, 12);

  for (const doi of dois) {
    const url = new URL(links.paperlogUrlForDoi(doi));
    assert.equal(url.origin, "https://paperlog.net");
    assert.equal(url.pathname, "/paper/resolve");
    assert.equal(url.searchParams.get("doi"), `doi:${doi}`);
  }
  assert.match(page, /View on Paperlog ↗/);
  assert.match(page, /https:\/\/doi\.org\/\$\{paper\.doi\}/);
  assert.match(page, /paperlogUrlForDoi\(paper\.doi\)/);
  assert.doesNotMatch(page, />Read paper ↗</);
});

test("profiles are private, keyed, mode-aware, server-scored, and deletable", async () => {
  const [service, initialMigration, hardeningMigration, expansionMigration, profile, privacy, worker] = await Promise.all([
    readFile(new URL("../app/profile-service.ts", import.meta.url), "utf8"),
    readFile(new URL("../drizzle/0000_fancy_orphan.sql", import.meta.url), "utf8"),
    readFile(new URL("../drizzle/0001_cuddly_guardsmen.sql", import.meta.url), "utf8"),
    readFile(new URL("../drizzle/0002_icy_doctor_faustus.sql", import.meta.url), "utf8"),
    readFile(new URL("../app/profile/profile-client.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/privacy/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../worker/index.ts", import.meta.url), "utf8"),
  ]);
  assert.match(service, /HMAC/);
  assert.match(service, /PROFILE_ID_SECRET/);
  assert.match(service, /selectedOption === question\.correct/);
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
  assert.match(expansionMigration, /ADD `game_mode`/);
  assert.match(expansionMigration, /CREATE TABLE `operational_metrics`/);
  assert.match(service, /shuffledPaperIds/);
  assert.match(service, /ABANDONED_SESSION_RETENTION = 7 \* DAY/);
  assert.match(service, /FEEDBACK_RETENTION = 365 \* DAY/);
  assert.match(service, /Too many requests/);
  assert.match(profile, /Delete all my data/);
  assert.match(privacy, /do not store your raw sign-in email or provider access or refresh tokens/);
  assert.match(privacy, /available to the project owner for review/);
  assert.match(privacy, /no user identifier, IP address, page URL, or message text/);
  assert.match(worker, /Content-Security-Policy/);
  assert.match(worker, /X-Content-Type-Options/);
  assert.match(worker, /Strict-Transport-Security/);
});

test("optional authentication supports ChatGPT, Google, and GitHub without storing provider tokens", async () => {
  const [authConfig, authService, chatGPTAuth, authRoute, signInPage, signInClient, signOutControl, privacy] = await Promise.all([
    readFile(new URL("../auth.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/auth-service.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/chatgpt-auth.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/api/auth/[...nextauth]/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/sign-in/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/sign-in/sign-in-client.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/sign-out-control.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/privacy/page.tsx", import.meta.url), "utf8"),
  ]);
  assert.match(authConfig, /Google\(/);
  assert.match(authConfig, /GitHub\(/);
  assert.match(authConfig, /email_verified.*true/s);
  assert.match(authConfig, /api\.github\.com\/user\/emails/);
  assert.match(authConfig, /item\.verified === true/);
  assert.match(authConfig, /strategy: "jwt"/);
  assert.match(authConfig, /maxAge: 30 \* 24 \* 60 \* 60/);
  assert.doesNotMatch(authConfig, /token\.(accessToken|access_token|refreshToken|refresh_token)\s*=/);
  assert.match(authService, /await auth\(\)/);
  assert.match(authService, /getChatGPTUser/);
  assert.match(authService, /requireCurrentUser/);
  assert.match(chatGPTAuth, /safeRelativeReturnPath/);
  assert.match(chatGPTAuth, /pathname\.startsWith\("\/api\/auth\/"\)/);
  assert.match(authRoute, /export const \{ GET, POST \}/);
  assert.match(signInPage, /Optional player profile/);
  assert.match(signInClient, /Continue with ChatGPT/);
  assert.match(signInClient, /Continue with Google/);
  assert.match(signInClient, /Continue with GitHub/);
  assert.match(signOutControl, /signOut\(\{ redirectTo: destination \}\)/);
  assert.match(privacy, /same private Paper Picture profile/);
});

test("owner feedback inbox is protected, actionable, and exportable", async () => {
  const [service, page, client, listRoute, updateRoute, profilePage, backupHelpers] = await Promise.all([
    readFile(new URL("../app/profile-service.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/admin/feedback/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/admin/feedback/feedback-admin-client.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/api/admin/feedback/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/api/admin/feedback/[id]/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/profile/page.tsx", import.meta.url), "utf8"),
    importTypeScriptModule("../app/admin/feedback/backup-download.ts"),
  ]);
  assert.match(service, /ADMIN_EMAIL/);
  assert.match(service, /await requireAdmin\(\)/);
  assert.match(service, /FEEDBACK_STATUSES/);
  assert.match(service, /INNER JOIN profiles/);
  assert.match(service, /LIMIT 500/);
  const listFeedback = service.match(/export async function listFeedback[\s\S]*?\n}\n/)?.[0] ?? "";
  assert.doesNotMatch(listFeedback, /AS userKey|AS email|SELECT[^`]*email/i);
  assert.match(page, /notFound\(\)/);
  assert.match(listRoute, /listFeedback/);
  assert.match(updateRoute, /updateFeedbackStatus/);
  assert.match(client, /Download CSV/);
  assert.match(client, /paper-picture-feedback-/);
  assert.match(client, /verifyPrivateBackup/);
  assert.match(client, /Verified backup downloaded/);
  assert.match(client, /All statuses/);
  assert.match(client, /resolved/);
  assert.match(profilePage, /isAdminEmail/);

  const completeBackup = {
    format: "paper-picture-private-backup",
    formatVersion: 1,
    generatedAt: "2026-07-13T12:00:00.000Z",
    collections: [{ id: "open-graphics-01-v1", version: "1.0", label: "Collection 01" }],
    tables: Object.fromEntries(backupHelpers.REQUIRED_BACKUP_TABLES.map((table) => [table, []])),
  };
  assert.equal(backupHelpers.verifyPrivateBackup(completeBackup), completeBackup);
  assert.equal(backupHelpers.privateBackupFilename(completeBackup.generatedAt), "paper-picture-private-backup-2026-07-13T12-00-00Z.json");
  assert.throws(
    () => backupHelpers.verifyPrivateBackup({ ...completeBackup, tables: { ...completeBackup.tables, operational_metrics: undefined } }),
    /Missing tables: operational_metrics/,
  );
  assert.throws(() => backupHelpers.verifyPrivateBackup({ ...completeBackup, collections: [] }), /collection manifest/);
});

test("health endpoint reports both immutable collections without player data", async () => {
  const health = await readFile(new URL("../app/api/health/route.ts", import.meta.url), "utf8");
  assert.match(health, /status: "ok"/);
  assert.match(health, /collectionCatalog/);
  assert.match(health, /collectionStats/);
  assert.match(health, /Cache-Control.*no-store/);
  assert.doesNotMatch(health, /profile|feedback|user/i);
});

test("ships two separately versioned collections with 36 approved image assets", async () => {
  const [data, data02] = await Promise.all([
    readFile(new URL("../data/papers.ts", import.meta.url), "utf8"),
    readFile(new URL("../data/open-graphics-02.ts", import.meta.url), "utf8"),
  ]);
  assert.match(data, /id: "goal-adaptive-meshing"/);
  assert.match(data, /id: "functional-maps-morphing"/);
  assert.match(data, /id: "topology-aerodynamic"/);
  assert.match(data, /id: "mesh-assimilation"/);
  assert.match(data, /id: "tubular-hex-meshing"/);
  assert.match(data, /id: "cadgcl-retrieval"/);
  assert.equal((data.match(/licenseUrl: ccBy/g) ?? []).length, 18);
  assert.equal((data.match(/src: "\/papers\//g) ?? []).length, 18);
  assert.match(data02, /id: "mesh-transformations"/);
  assert.match(data02, /id: "cad-iga-pipeline"/);
  assert.match(data02, /id: "deep-mesh-generation"/);
  assert.match(data02, /id: "nurbs-nefem"/);
  assert.match(data02, /id: "boundary-matching"/);
  assert.match(data02, /id: "ml-flow-adaptation"/);
  assert.equal((data02.match(/licenseUrl: ccBy/g) ?? []).length, 18);
  assert.equal((data02.match(/src: "\/papers\//g) ?? []).length, 18);
  assert.match(data, /maximumCollectionScore = collectionPaperCount \* 100/);
  assert.match(data, /pointsForImagesSeen/);
  assert.match(data, /open-graphics-01-v1/);
  assert.match(data02, /open-graphics-02-v1/);
  assert.match(data, /paper\.figures\.every\(\(figure\) => figure\.rightsStatus === "approved"\)/);
  assert.doesNotMatch(data, /Northbridge|Bellweather|Arcadia|fictional/i);
  assert.doesNotMatch(data02, /Northbridge|Bellweather|Arcadia|fictional/i);
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
    "mesh-transformations/fig1.png",
    "mesh-transformations/fig5.png",
    "mesh-transformations/fig7.jpg",
    "cad-iga-pipeline/fig16.png",
    "cad-iga-pipeline/fig18.png",
    "cad-iga-pipeline/fig22.png",
    "deep-mesh-generation/fig1.png",
    "deep-mesh-generation/fig7.png",
    "deep-mesh-generation/fig8.png",
    "nurbs-nefem/fig1.png",
    "nurbs-nefem/fig14.png",
    "nurbs-nefem/fig27.png",
    "boundary-matching/fig1.png",
    "boundary-matching/fig11.png",
    "boundary-matching/fig12.png",
    "ml-flow-adaptation/fig1.png",
    "ml-flow-adaptation/fig10.png",
    "ml-flow-adaptation/fig14.png",
  ].map((file) => access(new URL(`../public/papers/${file}`, import.meta.url))));
});

test("rights evidence matches every shipped publisher asset in both collections", async () => {
  const [evidence, evidence02] = await Promise.all([
    readFile(new URL("../data/rights-evidence.json", import.meta.url), "utf8").then(JSON.parse),
    readFile(new URL("../data/rights-evidence-02.json", import.meta.url), "utf8").then(JSON.parse),
  ]);
  assert.equal(evidence.collectionId, "open-graphics-01-v1");
  assert.equal(evidence.papers.length, 6);
  const figures = evidence.papers.flatMap((paper) => paper.figures);
  assert.equal(figures.length, 18);
  assert.equal(evidence02.collectionId, "open-graphics-02-v1");
  assert.equal(evidence02.papers.length, 6);
  const figures02 = evidence02.papers.flatMap((paper) => paper.figures);
  assert.equal(figures02.length, 18);
  for (const figure of [...figures, ...figures02]) {
    const bytes = await readFile(new URL(`../${figure.path}`, import.meta.url));
    assert.equal(createHash("sha256").update(bytes).digest("hex"), figure.sha256, figure.path);
  }
});

test("operational monitoring is aggregate-only and owner protected", async () => {
  const [service, route, privacy] = await Promise.all([
    readFile(new URL("../app/profile-service.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/api/admin/metrics/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/privacy/page.tsx", import.meta.url), "utf8"),
  ]);
  const metricsFunction = service.match(/export async function getOperationalMetrics[\s\S]*?\n}\n/)?.[0] ?? "";
  assert.match(metricsFunction, /await requireAdmin\(\)/);
  assert.match(metricsFunction, /SELECT metric, bucket_start/);
  assert.doesNotMatch(metricsFunction, /user_key|display_name|email|ip_address/i);
  assert.match(metricsFunction, /no user, IP, URL, or message fields/);
  assert.match(service, /if \(error\.status >= 500\) await recordMetric\("api_error"\)/);
  assert.match(route, /getOperationalMetrics/);
  assert.match(privacy, /Aggregate operational counters are removed after 90 days/);
});

test("search metadata and Paper Picture favicon assets are complete", async () => {
  const [layout, manifest, robots, sitemap] = await Promise.all([
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/manifest.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/robots.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/sitemap.ts", import.meta.url), "utf8"),
  ]);
  assert.match(layout, /favicon\.ico/);
  assert.match(layout, /favicon-48\.png/);
  assert.match(layout, /apple-touch-icon\.png/);
  assert.match(layout, /application\/ld\+json/);
  assert.match(layout, /"@type": "WebSite"/);
  assert.match(layout, /index: true/);
  assert.match(manifest, /icon-192\.png/);
  assert.match(manifest, /icon-512\.png/);
  assert.match(robots, /sitemap: "https:\/\/paperpicture\.net\/sitemap\.xml"/);
  assert.doesNotMatch(robots, /host:/);
  assert.match(robots, /"\/about"/);
  assert.match(robots, /"\/terms"/);
  assert.match(sitemap, /"\/about"/);
  assert.match(sitemap, /"\/terms"/);
  assert.match(sitemap, /2026-07-14/);
  await Promise.all([
    "favicon.ico",
    "favicon-48.png",
    "apple-touch-icon.png",
    "icon-192.png",
    "icon-512.png",
  ].map((file) => access(new URL(`../public/${file}`, import.meta.url))));
});
