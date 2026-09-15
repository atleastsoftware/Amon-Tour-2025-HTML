import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { buildSite, listRoutes, renderRoute } from "../src/build.js";
import { fsSource, loadContent } from "../src/content.js";

const content = loadContent(fsSource(path.resolve("content")));
const expected = [
  "/", "/tours", "/experiences", "/custom-tour", "/contact", "/cruise", "/blog",
  "/destinations", "/stays", "/external-stays", "/krabi-celebration", "/become-partner",
  "/group-corporate", "/brochure", "/villas-krabi", "/privacy-policy", "/terms-conditions",
  "/legal-notice", "/about", "/tour-ninja-iframe",
  ...content.destinations.map((d) => `/destinations/${d.slug}`),
  ...content.legacyTours.map((t) => `/tour-detail/${t.id}`),
  ...content.blog.posts.filter((p) => p.meta.status === "published").map((p) => `/blog/${p.meta.slug}`),
];

test("listRoutes expose toutes les routes publiques", () => {
  const routes = new Set(listRoutes(content).map((r) => r.path));
  expected.forEach((route) => assert.ok(routes.has(route), `route absente : ${route}`));
});

test("rendu SEO et composants interactifs", () => {
  assert.match(renderRoute(content, "/", "en")!.html, /<h1[^>]*>.*Amon|<h1[^>]*>Private tours/is);
  assert.match(renderRoute(content, "/tours", "en")!.html, /js-tour-catalogue/);
  assert.match(renderRoute(content, "/tours", "en")!.html, /data-language="en"/);
  const post = content.blog.posts.find((p) => p.meta.status === "published")!;
  assert.match(renderRoute(content, `/blog/${post.meta.slug}`, "en")!.html, /"BlogPosting"/);
  const french = renderRoute(content, "/", "fr")!.html;
  assert.match(french, /name="robots" content="noindex, follow"/);
  assert.match(french, /rel="canonical" href="https:\/\/amon-tour\.com\/"/);
  assert.match(renderRoute(content, "/tour-ninja-iframe", "en")!.html, /data-tour-ninja-iframe/);
});

test("build écrit les variantes, le sitemap et les ressources", async (t) => {
  const out = fs.mkdtempSync(path.join(os.tmpdir(), "amon-site-"));
  t.after(() => fs.rmSync(out, { recursive: true, force: true }));
  const report = await buildSite(content, { outDir: out });
  assert.equal(Object.keys(report.unsupportedSections).length, 0);
  for (const route of expected) {
    const rel = route === "/" ? "" : route.slice(1);
    assert.ok(fs.existsSync(path.join(out, rel, "index.html")), route);
  }
  assert.ok(fs.existsSync(path.join(out, "fr", "tours", "index.html")));
  assert.ok(fs.existsSync(path.join(out, "es", "tours", "index.html")));
  const sitemap = fs.readFileSync(path.join(out, "sitemap.xml"), "utf8");
  listRoutes(content).filter((r) => r.sitemap).forEach((r) => assert.match(sitemap, new RegExp(`<loc>${content.site.baseUrl}${r.path.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}</loc>`)));
});

test("la commande validate retourne OK", () => {
  const stdout = execFileSync("npx", ["tsx", "site/src/cli.ts", "validate"], { encoding: "utf8" });
  assert.match(stdout, /^OK/);
});