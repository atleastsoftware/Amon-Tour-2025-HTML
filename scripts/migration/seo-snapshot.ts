/**
 * Instantané SEO (avant/après migration).
 *
 *   npx tsx scripts/migration/seo-snapshot.ts capture --base https://amon-tour.com --out exports/seo-baseline
 *   npx tsx scripts/migration/seo-snapshot.ts capture --dist site/dist --out /tmp/seo-after
 *   npx tsx scripts/migration/seo-snapshot.ts compare exports/seo-baseline /tmp/seo-after
 *
 * Pour chaque URL du sitemap : title, description, canonical, robots, hreflang, types JSON-LD, H1.
 */
import fs from "node:fs";
import path from "node:path";

type Snap = { url: string; status: number; title?: string; description?: string; canonical?: string; robots?: string; hreflang: string[]; jsonLd: string[]; h1?: string; og: Record<string, string> };

const args = process.argv.slice(2);
const cmd = args[0];
const opt = (k: string, d = "") => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };

const attr = (tag: string, name: string) => { const m = tag.match(new RegExp(`${name}\\s*=\\s*"([^"]*)"`, "i")) ?? tag.match(new RegExp(`${name}\\s*=\\s*'([^']*)'`, "i")); return m?.[1]; };
const decode = (s: string) => s.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">");

export function analyse(url: string, status: number, html: string): Snap {
  const head = html.match(/<head[^>]*>([\s\S]*?)<\/head>/i)?.[1] ?? html;
  const metas = [...head.matchAll(/<meta\b[^>]*>/gi)].map((m) => m[0]);
  const links = [...head.matchAll(/<link\b[^>]*>/gi)].map((m) => m[0]);
  const meta = (n: string) => { const t = metas.find((m) => (attr(m, "name") ?? attr(m, "property"))?.toLowerCase() === n); return t ? decode(attr(t, "content") ?? "") : undefined; };
  const og: Record<string, string> = {};
  for (const m of metas) { const p = attr(m, "property"); if (p?.startsWith("og:")) og[p] = decode(attr(m, "content") ?? ""); }
  const jsonLd = [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)].flatMap((m) => {
    try { const j = JSON.parse(m[1]); const arr = Array.isArray(j) ? j : j["@graph"] ?? [j]; return arr.map((x: any) => String(x["@type"])); } catch { return ["<invalid>"]; }
  }).sort();
  return {
    url, status,
    title: decode(head.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? "").trim() || undefined,
    description: meta("description"), robots: meta("robots"),
    canonical: links.filter((l) => attr(l, "rel") === "canonical").map((l) => attr(l, "href"))[0],
    hreflang: links.filter((l) => attr(l, "rel") === "alternate" && attr(l, "hreflang")).map((l) => `${attr(l, "hreflang")}=${attr(l, "href")}`).sort(),
    jsonLd,
    h1: decode((html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1] ?? "").replace(/<[^>]+>/g, "")).replace(/\s+/g, " ").trim() || undefined,
    og,
  };
}

async function capture() {
  const base = opt("--base"); const dist = opt("--dist"); const out = opt("--out", "exports/seo-baseline");
  fs.mkdirSync(out, { recursive: true });
  const read = async (p: string): Promise<{ status: number; body: string }> => {
    if (dist) {
      const candidates = [path.join(dist, p, "index.html"), path.join(dist, p), path.join(dist, p + ".html")];
      const f = candidates.find((c) => fs.existsSync(c) && fs.statSync(c).isFile());
      return f ? { status: 200, body: fs.readFileSync(f, "utf8") } : { status: 404, body: "" };
    }
    const r = await fetch(base + p, { headers: { "user-agent": "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)" }, redirect: "manual" });
    return { status: r.status, body: await r.text() };
  };
  const sitemap = await read("/sitemap.xml");
  fs.writeFileSync(path.join(out, "sitemap.xml"), sitemap.body);
  fs.writeFileSync(path.join(out, "robots.txt"), (await read("/robots.txt")).body);
  const urls = [...sitemap.body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
  const extra = ["/tour-ninja-iframe", "/experiences", "/stays", "/about", "/legal-notice", "/external-stays"];
  const all = [...new Set([...urls, ...extra])];
  const snaps: Snap[] = [];
  for (const p of all) {
    const { status, body } = await read(p);
    snaps.push(analyse(p, status, body));
    process.stdout.write(`${status} ${p}\n`);
  }
  fs.writeFileSync(path.join(out, "pages.json"), JSON.stringify(snaps, null, 2) + "\n");
  console.log(`[seo-snapshot] ${snaps.length} pages -> ${out}`);
}

function compare() {
  const a = JSON.parse(fs.readFileSync(path.join(args[1], "pages.json"), "utf8")) as Snap[];
  const b = JSON.parse(fs.readFileSync(path.join(args[2], "pages.json"), "utf8")) as Snap[];
  const byUrl = new Map(b.map((s) => [s.url, s]));
  const locs = (f: string) => [...fs.readFileSync(f, "utf8").matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]).sort();
  const sa = locs(path.join(args[1], "sitemap.xml")), sb = locs(path.join(args[2], "sitemap.xml"));
  let diffs = 0;
  const report: string[] = [`# Comparaison SEO avant/après`, "", `Sitemap : ${sa.length} URL avant, ${sb.length} après. Manquantes après : ${sa.filter((u) => !sb.includes(u)).join(", ") || "aucune"}. Nouvelles : ${sb.filter((u) => !sa.includes(u)).join(", ") || "aucune"}.`, ""];
  if (sa.join() !== sb.join()) diffs++;
  report.push("| URL | statut | title | description | canonical | robots | hreflang | JSON-LD | H1 |", "|---|---|---|---|---|---|---|---|---|");
  for (const s of a) {
    const t = byUrl.get(s.url);
    const cell = (x: any, y: any) => { const same = JSON.stringify(x) === JSON.stringify(y); if (!same) diffs++; return same ? "=" : `≠ (${JSON.stringify(x)} → ${JSON.stringify(y)})`.slice(0, 160); };
    if (!t) { report.push(`| ${s.url} | ❌ absente | | | | | | | |`); diffs++; continue; }
    report.push(`| ${s.url} | ${s.status}→${t.status} | ${cell(s.title, t.title)} | ${cell(s.description, t.description)} | ${cell(s.canonical, t.canonical)} | ${cell(s.robots, t.robots)} | ${cell(s.hreflang, t.hreflang)} | ${cell(s.jsonLd, t.jsonLd)} | ${cell(s.h1, t.h1)} |`);
  }
  report.push("", `Différences : ${diffs}`);
  const outFile = opt("--out", "docs/migration/SEO-COMPARAISON.md");
  fs.writeFileSync(outFile, report.join("\n") + "\n");
  console.log(report.join("\n"));
  process.exitCode = diffs ? 1 : 0;
}

if (cmd === "capture") capture().catch((e) => { console.error(e); process.exit(1); });
else if (cmd === "compare") compare();
else { console.error("usage: seo-snapshot.ts capture|compare"); process.exit(2); }
