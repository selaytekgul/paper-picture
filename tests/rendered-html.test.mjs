import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the real open-graphics collection", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>Paper Picture — A visual research game<\/title>/i);
  assert.match(html, /Open Graphics Collection 01/);
  assert.match(html, /Play the real collection/);
  assert.match(html, /3 verified papers/);
  assert.match(html, /9 source-traceable figures/);
  assert.match(html, /CC BY 4\.0/);
  assert.match(html, />Source<\/a>/);
  assert.match(html, /papers\/goal-adaptive\/fig15\.png/);
  assert.doesNotMatch(html, /fictional|prototype collection|codex-preview/i);
});

test("ships only approved paper records and all nine image assets", async () => {
  const data = await readFile(new URL("../data/papers.ts", import.meta.url), "utf8");
  assert.match(data, /id: "goal-adaptive-meshing"/);
  assert.match(data, /id: "functional-maps-morphing"/);
  assert.match(data, /id: "topology-aerodynamic"/);
  assert.equal((data.match(/licenseUrl: ccBy/g) ?? []).length, 9);
  assert.equal((data.match(/src: "\/papers\//g) ?? []).length, 9);
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
  ].map((file) => access(new URL(`../public/papers/${file}`, import.meta.url))));
});
