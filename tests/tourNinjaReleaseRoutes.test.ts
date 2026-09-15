import assert from "node:assert/strict";
import test from "node:test";
import express from "express";
import { registerTourNinjaReleaseRoutes } from "../server/api/tourNinjaReleaseRoutes";
import type { TourNinjaReleaseSnapshot } from "../server/services/tourNinjaReleaseService";

test("HTTP contract isolates draft auth, pins previews and keeps public reads live", async () => {
  const calls: string[] = [];
  const app = express();
  registerTourNinjaReleaseRoutes(app, (req, res, next) => {
    // Test-only stand-in for the existing session middleware, not production auth.
    if (req.headers["x-test-admin"] === "yes") return next();
    res.status(401).json({ message: "Authentication required" });
  }, async mode => {
    calls.push(mode);
    return {
      enabled: true,
      release: {
        schemaVersion: "tourninja-release/v1",
        release: { id: `${mode}-1`, version: "1", status: mode, ...(mode === "live" ? { publishedAt: "2026-09-12T00:00:00Z" } : {}) },
        media: {}, pages: [],
      },
      fetchedAt: "2026-09-12T00:00:00Z",
      contentDigest: `${mode}-digest`,
    } as TourNinjaReleaseSnapshot;
  });
  const server = app.listen(0, "127.0.0.1");
  await new Promise<void>(resolve => server.once("listening", resolve));
  const address = server.address();
  assert.ok(address && typeof address !== "string");
  const base = `http://127.0.0.1:${address.port}`;
  try {
    const denied = await fetch(`${base}/api/admin/tour-ninja/releases/preview`);
    assert.equal(denied.status, 401);
    assert.match(denied.headers.get("cache-control")!, /no-store/);
    assert.match(denied.headers.get("x-robots-tag")!, /noindex/);
    assert.equal(calls.length, 0);

    const publicResult = await fetch(`${base}/api/tour-ninja/releases/live?mode=draft&url=https://attacker.example`);
    assert.equal((await publicResult.json()).release.release.status, "live");
    assert.deepEqual(calls, ["live"]);

    const preview = await fetch(`${base}/api/admin/tour-ninja/releases/preview`, { headers: { "x-test-admin": "yes" } });
    assert.equal(preview.status, 200);
    assert.equal((await preview.json()).contentDigest, "draft-digest");
    assert.match(preview.headers.get("cache-control")!, /private/);
    const changed = await fetch(`${base}/api/admin/tour-ninja/releases/preview`, {
      headers: { "x-test-admin": "yes", "x-tour-ninja-preview-digest": "old" },
    });
    assert.equal(changed.status, 409);
    assert.equal((await changed.json()).release, null);
    const pinned = await fetch(`${base}/api/admin/tour-ninja/releases/preview`, {
      headers: { "x-test-admin": "yes", "x-tour-ninja-preview-digest": "draft-digest" },
    });
    assert.equal(pinned.status, 200);
    const revoked = await fetch(`${base}/api/admin/tour-ninja/releases/preview`, {
      headers: { "x-tour-ninja-preview-digest": "draft-digest" },
    });
    assert.equal(revoked.status, 401);
  } finally {
    server.closeAllConnections();
    await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
  }
});