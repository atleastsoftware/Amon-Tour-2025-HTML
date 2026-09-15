// tests : stockage JSONL uniquement (jamais la base de production)
delete process.env.DATABASE_URL;
import assert from "node:assert/strict";
import fs from "node:fs";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createEdgeApp } from "../src/app.js";
import type { ContentProvider } from "../src/contentProvider.js";
import { transformCruiseToTourNinja, transformCustomTourToTourNinja } from "../src/transforms.js";
import { buildSite } from "../../site/src/build.js";
import { fsSource, loadContent } from "../../site/src/content.js";
import { serializeForm } from "../../site/src/formSerializer.js";

function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "amon-edge-"));
  const dist = path.join(root, "dist");
  fs.mkdirSync(dist);
  const content: any = {
    forms: [], imageOverrides: [], pages: [], destinations: [], staticPages: [], contentBlocks: [],
    navigation: { items: [] }, theme: { legacySettings: [] }, footer: {}, site: {}, announcements: {},
    redirects: [], legacyTours: [], blockTemplates: [], translations: {},
    blog: { posts: [], categories: [], tags: [] },
  };
  const provider: ContentProvider = {
    getContent: () => content,
    getVersion: () => ({ sha: "test-sha", source: "test", syncedAt: "2025-01-01T00:00:00.000Z" }),
    sync: async () => ({ changed: false, sha: "test-sha" }),
  };
  const app = createEdgeApp({ repoRoot: root, distDir: dist, contentProvider: provider });
  const server = http.createServer(app);
  return new Promise<{ root: string; dist: string; base: string; close: () => Promise<void> }>((resolve) => {
    server.listen(0, "127.0.0.1", () => {
      const address = server.address() as any;
      resolve({
        root, dist, base: `http://127.0.0.1:${address.port}`,
        close: () => new Promise<void>((done) => server.close(() => { fs.rmSync(root, { recursive: true, force: true }); done(); })),
      });
    });
  });
}

test("les routes sync appliquent l'authentification Bearer", async () => {
  const previous = process.env.TOUR_NINJA_SYNC_TOKEN;
  process.env.TOUR_NINJA_SYNC_TOKEN = "tour-ninja-sync-test";
  const ctx = await fixture();
  try {
    assert.equal((await fetch(`${ctx.base}/api/sync/tour-ninja`)).status, 401);
    const response = await fetch(`${ctx.base}/api/sync/tour-ninja`, {
      headers: { Authorization: "Bearer tour-ninja-sync-test" },
    });
    assert.equal(response.status, 200);
    assert.equal((await response.json() as any).success, true);
  } finally {
    if (previous === undefined) delete process.env.TOUR_NINJA_SYNC_TOKEN;
    else process.env.TOUR_NINJA_SYNC_TOKEN = previous;
    await ctx.close();
  }
});

test("les routes sync sont indisponibles sans token sans affecter le site", async () => {
  const previousSync = process.env.TOUR_NINJA_SYNC_TOKEN;
  const previousLegacy = process.env.TOUR_NINJA_API_KEY;
  delete process.env.TOUR_NINJA_SYNC_TOKEN;
  delete process.env.TOUR_NINJA_API_KEY;
  const ctx = await fixture();
  try {
    const response = await fetch(`${ctx.base}/api/sync/tour-ninja`, {
      headers: { Authorization: "Bearer unknown" },
    });
    assert.equal(response.status, 503);
    assert.equal((await fetch(`${ctx.base}/api/publish/status`)).status, 200);
  } finally {
    if (previousSync !== undefined) process.env.TOUR_NINJA_SYNC_TOKEN = previousSync;
    if (previousLegacy !== undefined) process.env.TOUR_NINJA_API_KEY = previousLegacy;
    await ctx.close();
  }
});

test("les transformations conservent exactement les champs historiques", () => {
  const custom = transformCustomTourToTourNinja({
    id: 7, fullName: "Ada", email: "ada@example.com", phoneNumber: "+66", numberOfAdults: 2,
    numberOfKids: 1, destinations: ["krabi"], interests: [], tripTypes: [], status: "new",
    createdAt: "2025-01-01", message: "Hello",
  });
  assert.deepEqual(custom, {
    customerName: "Ada", customerEmail: "ada@example.com", phone: "+66", tourDate: "Date flexible",
    numberOfAdults: 2, numberOfKids: 1, duration: "À définir", message: "Hello",
    destinations: ["krabi"], budget: "À discuter", status: "received",
    associatedTourName: "Krabi Adventure Tour", interests: [], tripTypes: [], amontourId: 7,
    originalCreatedAt: "2025-01-01", source: "amontour_custom_tour",
  });
  const cruise = transformCruiseToTourNinja({
    id: 8, fullName: "Lin", email: "lin@example.com", duration: "2 days", numberOfGuests: 3,
    itinerary: "Phi Phi", status: "pending", createdAt: "2025-01-02",
  });
  assert.equal(cruise.associatedTourName, "2-Day Island Cruise");
  assert.equal(cruise.numberOfKids, 0);
  assert.equal(cruise.source, "amontour_cruise");
});

test("un formulaire écrit une ligne JSONL et renvoie le contrat historique", async () => {
  const old = process.env.DATABASE_URL;
  delete process.env.DATABASE_URL;
  const ctx = await fixture();
  try {
    const response = await fetch(`${ctx.base}/api/contact-messages`, {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: "Ada", email: "ada@example.com", subject: "Voyage", message: "Bonjour" }),
    });
    assert.equal(response.status, 201);
    const body: any = await response.json();
    assert.equal(body.message, "Contact message sent successfully");
    assert.equal(fs.readFileSync(path.join(ctx.root, "edge/data/contact_messages.jsonl"), "utf8").trim().split("\n").length, 1);
  } finally {
    if (old) process.env.DATABASE_URL = old;
    await ctx.close();
  }
});

test("tous les formulaires HTML générés sont acceptés par leur endpoint edge", async () => {
  const ctx = await fixture();
  try {
    await buildSite(loadContent(fsSource(path.resolve("content"))), { outDir: ctx.dist });
    const cases = [
      {
        page: "custom-tour/index.html", endpoint: "/api/custom-tour", table: "custom_tour_requests",
        values: { fullName: "Ada Lovelace", email: "ada@example.com", phoneNumber: "+66 123", numberOfAdults: "2", numberOfKids: "0", duration: "4-7 days", message: "A private trip" },
      },
      {
        page: "contact/index.html", endpoint: "/api/contact-messages", table: "contact_messages", message: "Contact message sent successfully",
        values: { name: "Ada", email: "ada@example.com", subject: "Trip", message: "Hello" },
      },
      {
        page: "cruise/index.html", endpoint: "/api/cruise-requests", table: "cruise_requests", message: "Demande de croisière envoyée avec succès",
        values: { fullName: "Ada Lovelace", email: "ada@example.com", phone: "+66", numberOfGuests: "2", duration: "2 days", preferredDates: "January", itinerary: "Phi Phi", specialRequests: "None" },
      },
      {
        page: "krabi-celebration/index.html", endpoint: "/api/krabi-celebration", table: "krabi_celebration_requests", message: "Krabi Celebration request submitted successfully",
        values: { name: "Ada", email: "ada@example.com", celebrationType: "Birthday", guests: "4", date: "2026-01-10" },
      },
      {
        page: "become-partner/index.html", endpoint: "/api/partnership-requests", table: "partnership_requests", message: "Partnership request submitted successfully",
        values: { contactName: "Ada", companyName: "Analytical Tours", email: "ada@example.com", partnershipType: "Agency" },
      },
      {
        page: "group-corporate/index.html", endpoint: "/api/group-requests", table: "group_requests", message: "Group request submitted successfully",
        values: { contactName: "Ada", companyName: "Analytical Tours", email: "ada@example.com", groupSize: "12" },
      },
      {
        page: "index.html", endpoint: "/api/newsletter/subscribe", table: "newsletter_subscriptions", message: "Thank you for subscribing!",
        values: { email: "newsletter@example.com" },
      },
    ];

    for (const item of cases) {
      const html = fs.readFileSync(path.join(ctx.dist, item.page), "utf8");
      const escapedEndpoint = item.endpoint.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const match = html.match(new RegExp(`<form[^>]*data-endpoint="${escapedEndpoint}"[^>]*>([\\s\\S]*?)<\\/form>`));
      assert.ok(match, `formulaire ${item.endpoint} absent de ${item.page}`);
      const controls: any[] = [];
      for (const field of match[1].matchAll(/<(input|textarea|select)\b([^>]*)>/g)) {
        const attrs = field[2], name = attrs.match(/\bname="([^"]+)"/)?.[1];
        if (!name) continue;
        const type = attrs.match(/\btype="([^"]+)"/)?.[1] || field[1];
        const value = (item.values as any)[name] ?? (attrs.match(/\bvalue="([^"]*)"/)?.[1] || "");
        controls.push({ name, type, value, checked: type === "checkbox" });
      }
      const body = serializeForm({ elements: controls });
      const response = await fetch(`${ctx.base}${item.endpoint}`, {
        method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body),
      });
      const responseText = await response.text();
      assert.equal(response.status, 201, `${item.endpoint}: ${responseText}`);
      const responseBody: any = JSON.parse(responseText);
      if (item.message) assert.ok(responseBody.message.includes(item.message));
      else assert.ok(responseBody.id);
      const rows = fs.readFileSync(path.join(ctx.root, `edge/data/${item.table}.jsonl`), "utf8").trim().split("\n");
      assert.equal(rows.length, 1, item.table);
    }
  } finally { await ctx.close(); }
});

test("le proxy Tour Ninja met en cache et fresh contourne le cache", async () => {
  const original = globalThis.fetch;
  let calls = 0;
  globalThis.fetch = (async (input: any, init?: any) => {
    if (String(input).includes("tourninja.io")) {
      calls++;
      return new Response(JSON.stringify({ success: true, tours: [{ id: "x", name: "Tour" }] }), {
        status: 200, headers: { "content-type": "application/json" },
      });
    }
    return original(input, init);
  }) as any;
  const ctx = await fixture();
  try {
    await original(`${ctx.base}/api/proxy/tours?language=test-cache`);
    await original(`${ctx.base}/api/proxy/tours?language=test-cache`);
    assert.equal(calls, 1);
    await original(`${ctx.base}/api/proxy/tours?language=test-cache&fresh=true`);
    assert.equal(calls, 2);
  } finally { globalThis.fetch = original; await ctx.close(); }
});

test("les redirections, la 404 et le statut de publication fonctionnent", async () => {
  const ctx = await fixture();
  try {
    fs.writeFileSync(path.join(ctx.dist, "_redirects.json"), JSON.stringify([
      { from: "/old/:slug", to: "/new/:slug", status: 302 },
    ]));
    fs.writeFileSync(path.join(ctx.dist, "404.html"), "<h1>Perdu</h1>");
    const redirect = await fetch(`${ctx.base}/old/example`, { redirect: "manual" });
    assert.equal(redirect.status, 302);
    assert.equal(redirect.headers.get("location"), "/new/example");
    assert.equal((await fetch(`${ctx.base}/missing`)).status, 404);
    const status: any = await (await fetch(`${ctx.base}/api/publish/status`)).json();
    assert.equal(status.sha, "test-sha");
  } finally { await ctx.close(); }
});

test("le proxy images refuse les origines privées, trompeuses et les redirections", async () => {
  const ctx = await fixture();
  const original = globalThis.fetch;
  let upstreamCalls = 0;
  globalThis.fetch = async (input, init) => {
    const target = String(input);
    if (target.startsWith(ctx.base)) return original(input, init);
    upstreamCalls++;
    assert.equal(init?.redirect, "error", "aucune redirection implicite");
    assert.match(target, /^https:\/\/(www\.)?tourninja\.io\//);
    if (target.endsWith("/redirect")) throw new TypeError("unexpected redirect");
    return new Response("image-fixture", { headers: { "content-type": "image/png" } });
  };
  try {
    for (const source of [
      "http://127.0.0.1/?tourninja.io",
      "https://169.254.169.254/?tourninja.io",
      "https://[::1]/?tourninja.io",
      "https://tourninja.io.evil.example/a",
      "https://tourninja.io@127.0.0.1/a",
      "https://user:pass@tourninja.io/a",
      "http://tourninja.io/a",
      "https://tourninja.io:8443/a",
      "not-a-url",
    ]) {
      const res = await fetch(`${ctx.base}/api/proxy/image?url=${encodeURIComponent(source)}`);
      assert.equal(res.status, 403, source);
    }
    assert.equal(upstreamCalls, 0, "aucune requête amont pour les URL interdites");
    for (const host of ["tourninja.io", "www.tourninja.io"]) {
      const res = await fetch(`${ctx.base}/api/proxy/image?url=${encodeURIComponent(`https://${host}/image.png`)}`);
      assert.equal(res.status, 200);
      assert.equal(await res.text(), "image-fixture");
    }
    const redirect = await fetch(`${ctx.base}/api/proxy/image?url=${encodeURIComponent("https://tourninja.io/redirect")}`);
    assert.equal(redirect.status, 500);
    assert.equal(upstreamCalls, 3);
  } finally {
    globalThis.fetch = original;
    await ctx.close();
  }
});