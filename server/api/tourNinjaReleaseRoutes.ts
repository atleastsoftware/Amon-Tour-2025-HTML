import type { Express, RequestHandler } from "express";
import { getTourNinjaReleaseSnapshot } from "../services/tourNinjaReleaseService";

/** Read-only endpoints: no writes to the CMS, upstream or deployment APIs. */
export function registerTourNinjaReleaseRoutes(
  app: Express,
  requireAuth: RequestHandler,
  load = getTourNinjaReleaseSnapshot,
) {
  app.get("/api/tour-ninja/releases/live", async (_req, res) => {
    res.setHeader("Cache-Control", "no-store");
    const snapshot = await load("live");
    if (snapshot.enabled) {
      res.setHeader("X-Tour-Ninja-Release", `${snapshot.release.release.id}@${snapshot.release.release.version}`);
    }
    res.json(snapshot);
  });

  app.get("/api/admin/tour-ninja/releases/preview", (_req, res, next) => {
    // Also protect errors and unauthenticated responses from shared caches.
    res.setHeader("Cache-Control", "no-store, private");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("X-Robots-Tag", "noindex, nofollow, noarchive");
    res.vary("Cookie");
    next();
  }, requireAuth, async (req, res) => {
    const snapshot = await load("draft");
    const expectedDigest = req.get("X-Tour-Ninja-Preview-Digest");
    if (expectedDigest && (!snapshot.enabled || snapshot.contentDigest !== expectedDigest)) {
      res.status(409).json({ enabled: false, release: null, reason: "preview_changed" });
      return;
    }
    if (snapshot.enabled) {
      res.setHeader("X-Tour-Ninja-Release", `${snapshot.release.release.id}@${snapshot.release.release.version}`);
    }
    res.json({ ...snapshot, preview: true });
  });
}