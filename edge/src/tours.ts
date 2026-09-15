import { Router } from "express";
import { CACHE_TTL, clearCache, getCachedData, setCachedData } from "./tourCache.js";

function normalizeResponse(apiResponse: any): any[] {
  if (apiResponse?.success && Array.isArray(apiResponse.tours)) return apiResponse.tours.map((tour: any) => {
    const images: string[] = [];
    if (tour.image) images.push(`/api/tour-image-proxy/${tour.id}/0`);
    else if (Array.isArray(tour.images) && tour.images.length) {
      tour.images.forEach((image: string, index: number) => image && images.push(`/api/tour-image-proxy/${tour.id}/${index}`));
    } else if (tour.id) {
      for (let index = 0; index <= 4; index++) images.push(`/api/tour-image-proxy/${tour.id}/${index}`);
    } else images.push("https://via.placeholder.com/800x600/3BA8AF/ffffff?text=Tour+Image");
    const primaryImage = images[0] || null;
    return {
      id: tour.id, name: tour.name || tour.title, description: tour.description || "",
      shortDescription: tour.description ? `${tour.description.substring(0, 150)}...` : "",
      images, primaryImage, fallbackImage: primaryImage, presentationImageUrl: primaryImage,
      originalPrimaryImage: primaryImage, price: tour.price || 0, currency: tour.currency || "THB",
      duration: tour.duration || 1, location: tour.destination || "Krabi, Thailand",
      bookingUrl: tour.bookingUrl || tour.url || `https://www.tourninja.io/book/${tour.id}`,
      detailsUrl: tour.detailsUrl || tour.url || `https://www.tourninja.io/details/${tour.id}`,
      presentationUrl: tour.detailsUrl || tour.url || `https://www.tourninja.io/details/${tour.id}`,
      externalId: tour.id, slug: tour.slug || tour.name?.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      tourType: tour.tourType || "group", maxParticipants: tour.maxParticipants || 12, isActive: true,
      category: tour.category || "", tags: tour.tags || [], maxGuests: tour.maxParticipants || 12, minGuests: 1,
    };
  });
  if (Array.isArray(apiResponse)) return apiResponse.map((tour: any) => ({
    ...tour, primaryImage: tour.image || tour.images?.[0] || null,
    bookingUrl: tour.bookingUrl || tour.url || `https://www.tourninja.io/book/${tour.id}`,
    detailsUrl: tour.detailsUrl || tour.url || `https://www.tourninja.io/details/${tour.id}`,
    presentationUrl: tour.presentationUrl || tour.detailsUrl || tour.url || `https://www.tourninja.io/details/${tour.id}`,
    location: tour.location || "Krabi, Thailand",
  }));
  return Array.isArray(apiResponse?.data) ? apiResponse.data : [];
}

export function createTourRouter() {
  const router = Router();
  router.get("/api/proxy/tours", async (req, res) => {
    const language = String(req.query.language || "en");
    const fresh = req.query.fresh === "true";
    if (fresh) clearCache(language);
    const cached = getCachedData(language);
    const cacheAge = cached ? Date.now() - cached.timestamp : Infinity;
    if (cached && cacheAge < CACHE_TTL && !fresh) return res.json({
      success: true, data: cached.data, cached: true, cacheAge,
      timestamp: cached.timestamp, language,
    });
    try {
      const primary = `https://www.tourninja.io/api/public/tours?apiKey=tourninja-showcase-2-amontour&companyId=2&limit=100&language=${encodeURIComponent(language)}`;
      const fallback = `https://www.tourninja.io/api/public/tours/legacy?companyId=2&language=${encodeURIComponent(language)}`;
      let response: Response;
      try {
        response = await fetch(primary, { headers: { Accept: "application/json" }, signal: AbortSignal.timeout(30_000) });
        if (!response.ok) response = await fetch(fallback, { headers: { Accept: "application/json" }, signal: AbortSignal.timeout(30_000) });
      } catch {
        response = await fetch(fallback, { headers: { Accept: "application/json" }, signal: AbortSignal.timeout(30_000) });
      }
      if (!response.ok) throw new Error(`Tour Ninja API error: ${response.status}`);
      const tours = normalizeResponse(await response.json());
      setCachedData(language, tours);
      return res.json({ success: true, data: tours, cached: false,
        fallback: tours[0]?.id ? (String(tours[0].id).startsWith("demo") ? "demo" : "production") : "none",
        timestamp: Date.now(), language });
    } catch (error) {
      const stale = getCachedData(language);
      if (stale) return res.json({ success: true, data: stale.data, cached: true, fallback: true, timestamp: stale.timestamp, language });
      return res.json({ success: true, data: [], cached: false,
        message: "Tour Ninja API connection en cours de résolution", apiStatus: "connection_issue",
        error: process.env.NODE_ENV === "development" ? String(error) : undefined });
    }
  });
  router.get("/api/public/tour-showcase/:token", async (req, res) => {
    try {
      const response = await fetch("https://www.tourninja.io/api/public/tours/legacy?companyId=2", { headers: { Accept: "application/json" } });
      if (!response.ok) return res.status(404).json({ message: "Tour not found" });
      const data: any = await response.json();
      const tour = data.tours?.find((item: any) => item.id === req.params.token);
      return tour ? res.json(tour) : res.status(404).json({ message: "Tour not found" });
    } catch { return res.status(500).json({ message: "Server error" }); }
  });
  router.get("/api/tour-image-proxy/:tourId/:imageIndex", async (req, res) => {
    try {
      const response = await fetch(`https://www.tourninja.io/api/tours/images/${req.params.tourId}/${req.params.imageIndex}`, {
        headers: { Accept: "image/*,*/*", "x-api-key": process.env.TOUR_NINJA_SHOWCASE_KEY || "tourninja-showcase-2-amontour", "User-Agent": "Amon Tour Website" },
      });
      if (!response.ok) return res.redirect("https://placehold.co/600x400/1e73be/ffffff?text=Amon+Tour");
      res.set("Content-Type", response.headers.get("content-type") || "image/jpeg");
      res.set("Cache-Control", "public, max-age=3600");
      return res.send(Buffer.from(await response.arrayBuffer()));
    } catch { return res.redirect("https://placehold.co/600x400/1e73be/ffffff?text=Amon+Tour"); }
  });
  router.get("/api/proxy/image", async (req, res) => {
    const url = String(req.query.url || "");
    if (!url) return res.status(400).json({ error: "Image URL required" });
    let source: URL;
    try {
      source = new URL(url);
    } catch {
      return res.status(403).json({ error: "Unauthorized image source" });
    }
    if (source.protocol !== "https:" ||
        !["tourninja.io", "www.tourninja.io"].includes(source.hostname) ||
        source.username || source.password || source.port) {
      return res.status(403).json({ error: "Unauthorized image source" });
    }
    try {
      // Ne jamais suivre une redirection vers une origine non vérifiée (SSRF).
      const response = await fetch(source.href, { redirect: "error", headers: { "User-Agent": "Amon-Tour/1.0" }, signal: AbortSignal.timeout(15_000) });
      if (!response.ok) return res.status(404).json({ error: "Image not found" });
      const contentType = response.headers.get("content-type") || "";
      if (!contentType.startsWith("image/")) return res.status(415).json({ error: "Image content required" });
      res.set("Content-Type", contentType);
      res.set("X-Content-Type-Options", "nosniff");
      res.set("Cache-Control", "public, max-age=3600"); res.set("Access-Control-Allow-Origin", "*");
      return res.send(Buffer.from(await response.arrayBuffer()));
    } catch { return res.status(500).json({ error: "Failed to proxy image" }); }
  });
  return router;
}