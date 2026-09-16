import crypto from "node:crypto";
import { buildSite } from "../../site/src/build.js";
import fs from "node:fs";
import path from "node:path";
import express from "express";
import { marked } from "marked";
import type { ContentProvider } from "./contentProvider.js";
import { EdgeStorage } from "./storage.js";
import { createFormsRouter } from "./forms.js";
import { createTourRouter } from "./tours.js";

export interface EdgeAppOptions {
  distDir: string;
  repoRoot: string;
  contentProvider: ContentProvider;
  mcpRouter?: express.Router;
}

function legacySettings(content: any, section: string) {
  return (content.theme.legacySettings || []).filter((setting: any) => setting.section === section);
}
function redirectMatcher(pattern: string) {
  const names: string[] = [];
  const source = pattern.split("/").map((part) => {
    if (part.startsWith(":")) { names.push(part.slice(1)); return "([^/]+)"; }
    return part.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }).join("/");
  return { regex: new RegExp(`^${source}/?$`), names };
}

export function createEdgeApp(opts: EdgeAppOptions): express.Express {
  const app = express();
  const storage = new EdgeStorage(opts.repoRoot);
  let builtAt: string | null = fs.existsSync(opts.distDir) ? new Date().toISOString() : null;
  let routes: string[] = [];
  app.set("trust proxy", true);
  app.disable("x-powered-by");
  app.use((_req, res, next) => {
    res.set({
      "X-Content-Type-Options": "nosniff", "X-Frame-Options": "SAMEORIGIN",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
      "Content-Security-Policy": "frame-ancestors 'self'",
    });
    next();
  });
  app.use("/api", (_req, res, next) => { res.set("Cache-Control", "no-store"); next(); });
  app.use(express.json({
    limit: "1mb",
    verify(req: any, _res, buffer) { req.rawBody = Buffer.from(buffer); },
  }));
  app.use(express.urlencoded({ extended: false, limit: "1mb" }));

  const formHits = new Map<string, { count: number; start: number }>();
  app.use((req, res, next) => {
    if (req.method !== "POST" || !req.path.startsWith("/api/") || req.path.startsWith("/api/publish")) return next();
    const key = req.ip || "unknown"; const now = Date.now(); const hit = formHits.get(key);
    if (!hit || now - hit.start > 15 * 60_000) formHits.set(key, { count: 1, start: now });
    else if (++hit.count > 20) return res.status(429).json({ message: "Too many submission attempts, please try again later." });
    next();
  });
  app.use(createTourRouter());
  app.use(createFormsRouter(storage));

  app.get("/api/public/custom-forms/:id", (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ message: "Invalid form ID" });
    const form: any = opts.contentProvider.getContent().forms.find((item) => item.id === id);
    return form ? res.json({ ...form, ...form.colors }) : res.status(404).json({ message: "Custom form not found" });
  });
  app.get(["/api/public/tour-image-overrides", "/api/tour-ninja-image-overrides"], (_req, res) => {
    const active = opts.contentProvider.getContent().imageOverrides.filter((item: any) => item.active ?? item.isActive);
    res.json(active.map((item: any) => ({ ...item, isActive: item.active ?? item.isActive })));
  });
  app.get("/api/navigation-menu", (_req, res) => {
    const items = opts.contentProvider.getContent().navigation.items.filter((item: any) => item.active);
    res.json(items.map((item: any) => ({ ...item, name: item.label?.en, isActive: item.active })));
  });
  app.get("/api/public/theme-settings", (_req, res) => res.json(legacySettings(opts.contentProvider.getContent(), "theme")));
  app.get("/api/public/header-settings", (_req, res) => res.json(legacySettings(opts.contentProvider.getContent(), "header")));
  app.get("/api/public/footer-settings", (_req, res) => res.json(legacySettings(opts.contentProvider.getContent(), "footer")));
  app.get("/api/public/page-blocks/:slug", (req, res) => {
    const page = opts.contentProvider.getContent().pages.find((item) => item.slug === req.params.slug);
    res.json((page?.sections || []).filter((section) => section.active).map((section) => ({
      id: section.legacy?.blockId || section.id, identifier: section.id, blockType: section.type,
      displayOrder: section.order, isActive: section.active, configuration: section.props,
    })));
  });
  const blogPost = (post: any, index: number) => ({
    id: index + 1, ...post.meta, content: marked.parse(post.body), status: "published",
    publishDate: post.meta.publishDate || post.meta.date, coverImage: post.meta.coverImage || post.meta.image,
  });
  app.get("/api/blog/posts", (req, res) => {
    let posts = opts.contentProvider.getContent().blog.posts.map(blogPost);
    if (req.query.category) posts = posts.filter((post: any) => post.category === req.query.category);
    if (req.query.tag) posts = posts.filter((post: any) => post.tags?.includes(req.query.tag));
    res.json(posts);
  });
  app.get(["/api/blog/posts/slug/:slug", "/api/blog/posts/:slug"], (req, res) => {
    const index = opts.contentProvider.getContent().blog.posts.findIndex((post) => post.meta.slug === req.params.slug);
    return index < 0 ? res.status(404).json({ message: "Post not found" })
      : res.json(blogPost(opts.contentProvider.getContent().blog.posts[index], index));
  });

  const rebuild = async () => {
    const sync = await opts.contentProvider.sync();
    const report = await buildSite(opts.contentProvider.getContent(), { outDir: opts.distDir });
    routes = (report.routes || []).map((r: any) => r.path); builtAt = new Date().toISOString();
    return sync;
  };
  app.get("/api/publish/status", (_req, res) => {
    const version = opts.contentProvider.getVersion();
    res.json({ ...version, builtAt, routes, ok: !version.syncError });
  });
  app.post("/api/publish/rebuild", async (req, res) => {
    const bearer = !!process.env.MCP_AUTH_TOKEN && req.headers.authorization === `Bearer ${process.env.MCP_AUTH_TOKEN}`;
    const signature = String(req.headers["x-hub-signature-256"] || "");
    const secret = process.env.PUBLISH_WEBHOOK_SECRET;
    const rawBody = (req as any).rawBody || Buffer.from(JSON.stringify(req.body));
    const expected = secret ? `sha256=${crypto.createHmac("sha256", secret).update(rawBody).digest("hex")}` : "";
    const signed = !!secret && signature.length === expected.length && crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
    if (!bearer && !signed) return res.status(401).json({ message: "Unauthorized" });
    await rebuild();
    const version = opts.contentProvider.getVersion();
    const ok = !version.syncError;
    return res.status(ok ? 200 : 503).json({ ...version, builtAt, routes, ok });
  });
  if (opts.mcpRouter) app.use("/mcp", opts.mcpRouter);

  const staticOptions = { setHeaders: (res: express.Response, file: string) => {
    res.set("Cache-Control", /\.[a-f0-9]{8,}\./i.test(path.basename(file)) ? "public, max-age=31536000, immutable" : "public, max-age=3600");
  }};
  // Vitrine Tour Ninja /tour/:token (route dynamique historique) → page unique hydratée côté client.
  app.get(["/tour/:token", "/fr/tour/:token", "/es/tour/:token"], (req, res, next) => {
    const prefix = req.path.startsWith("/fr/") ? "fr/" : req.path.startsWith("/es/") ? "es/" : "";
    const file = path.join(opts.distDir, prefix, "tour/_token/index.html");
    return fs.existsSync(file) ? res.set("Cache-Control", "public, max-age=300").sendFile(file) : next();
  });
  // Les pages sont écrites sous <dist>/<chemin>/index.html : on les sert sans redirection vers
  // le slash final (les URL historiques n'ont pas de slash final).
  app.use((req, res, next) => {
    if (req.method !== "GET" && req.method !== "HEAD") return next();
    const clean = decodeURIComponent(req.path).replace(/\/+$/, "") || "/";
    const candidate = path.join(opts.distDir, clean === "/" ? "index.html" : `${clean}/index.html`);
    if (!candidate.startsWith(opts.distDir) || !fs.existsSync(candidate)) return next();
    if (req.path !== "/" && req.path.endsWith("/")) return res.redirect(301, clean + (req.url.includes("?") ? req.url.slice(req.url.indexOf("?")) : ""));
    res.set("Cache-Control", "public, max-age=300");
    return res.sendFile(candidate);
  });
  app.use(express.static(opts.distDir, { ...staticOptions, extensions: ["html"], redirect: false, index: false }));
  for (const root of ["uploads", "attached_assets", "media"]) {
    app.use(`/${root}`, express.static(path.join(opts.repoRoot, root), staticOptions));
  }
  app.use((req, res, next) => {
    const file = path.join(opts.distDir, "_redirects.json");
    if (!fs.existsSync(file)) return next();
    try {
      const definitions = JSON.parse(fs.readFileSync(file, "utf8"));
      for (const item of definitions) {
        const { regex, names } = redirectMatcher(item.from || item.source);
        const match = req.path.match(regex);
        if (!match) continue;
        let target = item.to || item.destination;
        names.forEach((name, index) => { target = target.replace(`:${name}`, match[index + 1]); });
        return res.redirect(item.status || item.statusCode || 301, target);
      }
    } catch (error) { console.error("Redirections invalides :", error); }
    next();
  });
  app.use((_req, res) => {
    const file = path.join(opts.distDir, "404.html");
    if (fs.existsSync(file)) return res.status(404).sendFile(file);
    return res.status(404).type("text").send("Not Found");
  });
  return app;
}