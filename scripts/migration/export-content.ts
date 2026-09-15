/**
 * Export PostgreSQL CMS data -> Git content model (content/, media/) + transactional archive.
 *
 * Read-only against the source database. Never writes to the DB.
 *
 *   SOURCE_DATABASE_URL=... npx tsx scripts/migration/export-content.ts [--out content] [--archive exports/archive]
 *
 * Defaults: SOURCE_DATABASE_URL || NEON_DATABASE_URL (production) || DATABASE_URL.
 * Produces:
 *   content/**                        validated against site/src/schema.ts
 *   media/manifest.json               media library + referenced files
 *   exports/archive/<date>/*.json     transactional tables (one file per table, all rows)
 *   exports/archive/<date>/inventory.json + docs/migration/INVENTAIRE.md (row counts before/after)
 */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";
import { fileURLToPath } from "node:url";
import { loadContent, fsSource, stringifyJson, stringifyMarkdown } from "../../site/src/content.js";
import { CONTENT_FILES, pagePathFromSlug, type Page, type Section } from "../../site/src/schema.js";
import { DESTINATIONS } from "../../server/ssrDestinationRoutes.js";

neonConfig.webSocketConstructor = ws as any;

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const args = process.argv.slice(2);
const argOf = (k: string, d: string) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const OUT = path.resolve(ROOT, argOf("--out", "content"));
const MEDIA_OUT = path.resolve(ROOT, "media");
const STAMP = argOf("--stamp", new Date().toISOString().slice(0, 10));
const ARCHIVE = path.resolve(ROOT, argOf("--archive", "exports/archive"), STAMP);

const connectionString = process.env.SOURCE_DATABASE_URL || process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;
if (!connectionString) throw new Error("SOURCE_DATABASE_URL / NEON_DATABASE_URL / DATABASE_URL must be set");

const pool = new Pool({ connectionString });
const q = async <T = any>(sql: string, params: any[] = []): Promise<T[]> => (await pool.query(sql, params)).rows as T[];

const CMS_TABLES = [
  "page_configurations", "page_blocks", "page_block_history", "block_templates", "navigation_menu_items", "site_settings",
  "static_pages", "blog_posts", "blog_categories", "blog_tags", "blog_post_tags", "media_library", "tour_ninja_image_overrides",
  "custom_forms", "content_blocks", "tours", "tour_cards",
];
const TRANSACTIONAL_TABLES = [
  "custom_tour_requests", "cruise_requests", "group_requests", "partnership_requests", "krabi_celebration_requests",
  "contact_messages", "newsletter_subscriptions", "reservations", "tour_availability", "custom_form_submissions", "users",
];

const write = (file: string, data: string) => { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, data); };
const iso = (v: any) => (v instanceof Date ? v.toISOString() : v == null ? undefined : String(v));
const camel = (s: string) => s.replace(/_([a-z0-9])/g, (_, c) => c.toUpperCase());
const parseMaybeJson = (v: any) => { if (typeof v !== "string") return v; try { return JSON.parse(v); } catch { return v; } };
const sha256 = (buf: Buffer) => crypto.createHash("sha256").update(buf).digest("hex");

async function main() {
  console.log(`[export] source=${connectionString!.replace(/:\/\/.*@/, "://***@")}`);
  console.log(`[export] out=${OUT} archive=${ARCHIVE}`);

  // ── Row counts (before) ──────────────────────────────────────────────
  const allTables = (await q<{ table_name: string }>(`select table_name from information_schema.tables where table_schema='public' order by 1`)).map((r) => r.table_name);
  const counts: Record<string, number> = {};
  for (const t of allTables) counts[t] = (await q<{ n: number }>(`select count(*)::int as n from "${t}"`))[0].n;

  // ── Load CMS tables ─────────────────────────────────────────────────
  const pageConfigs = await q(`select * from page_configurations order by id`);
  const blocks = await q(`select * from page_blocks order by page_id, block_order, id`);
  const blockHistory = await q(`select * from page_block_history order by block_id, version, id`);
  const templates = await q(`select * from block_templates order by id`);
  const navItems = await q(`select * from navigation_menu_items order by display_order, id`);
  const settings = await q(`select * from site_settings order by id`);
  const staticPages = await q(`select * from static_pages order by id`);
  const blogPosts = await q(`select * from blog_posts order by id`);
  const blogCats = await q(`select * from blog_categories order by id`);
  const blogTags = await q(`select * from blog_tags order by id`);
  const blogPostTags = await q(`select * from blog_post_tags order by id`);
  const media = await q(`select * from media_library order by id`);
  const overrides = await q(`select * from tour_ninja_image_overrides order by id`);
  const forms = await q(`select * from custom_forms order by id`);
  const contentBlocks = await q(`select * from content_blocks order by id`);
  const legacyTours = await q(`select * from tours order by id`);
  const tourCards = await q(`select * from tour_cards order by created_at`);

  // Locale catalogs (block translations live in client/src/locales/*.json keyed `${type}_${blockId}`)
  const locales: Record<string, any> = {};
  for (const lang of ["en", "fr", "es"]) locales[lang] = JSON.parse(fs.readFileSync(path.join(ROOT, "client/src/locales", `${lang}.json`), "utf8"));

  // ── site.json / theme / navigation / footer / announcements ────────
  const setting = (section: string, key: string) => settings.find((s) => s.section === section && s.key === key)?.value ?? null;
  const settingJson = (section: string, key: string, fallback: any = null) => { const v = setting(section, key); return v == null ? fallback : parseMaybeJson(v); };

  const palette = settingJson("theme", "color_palette", {});
  const typography = settingJson("theme", "typography", {});
  const seoMeta = settingJson("theme", "seo_meta", {});

  const site = {
    name: "Amon Tour",
    baseUrl: "https://amon-tour.com",
    languages: ["en", "fr", "es"],
    defaultLanguage: "en",
    hreflangLocales: ["en", "en-MY", "en-SG", "en-AU", "fr", "th", "zh-CN", "zh-SG", "zh-MY", "ms", "x-default"],
    title: setting("general", "site_title") ?? "Amon Tour - Authentic Thailand Experiences",
    description: setting("general", "site_description") ?? "",
    brand: {
      primary: "#084F6E", primaryDark: "#063A52", gold: "#E6B64C", logo: "/favicon.png",
      phone: "+66 81 956 2849", phoneIntl: "+66819562849", whatsapp: "+66 86 476 3804", whatsappIntl: "66864763804",
      email: "contact@amon-tour.com", addressLine1: "Ao Nang, Krabi", addressLine2: "Thailand",
    },
    social: (settingJson("footer", "footer_social_media", []) as any[]).map((s) => s.url).filter((u) => /^https?:/.test(u)),
    organization: seoMeta,
    tourNinja: { baseUrl: "https://www.tourninja.io", companyId: "2", showcaseKey: "tourninja-showcase-2-amontour", catalogueCacheTtlHours: 24 },
  };
  write(path.join(OUT, CONTENT_FILES.site), stringifyJson(site));

  const theme = {
    colors: {
      primary: setting("theme", "primary_color") ?? palette.primary ?? "#084F6E",
      secondary: setting("theme", "secondary_color") ?? palette.secondary ?? "#3BA8AF",
      background: palette.background, text: palette.text, textLight: palette.text_light, border: palette.border,
      backgroundFooter: palette.backgroundFooter, textFooter: palette.textFooter,
      palette,
    },
    typography: {
      headingFont: setting("theme", "heading_font") ?? typography.heading_font ?? "Montserrat",
      bodyFont: setting("theme", "body_font") ?? typography.body_font ?? "Lato",
      accentFont: typography.accent_font, headingWeight: typography.heading_weight, bodyWeight: typography.body_weight,
      baseSize: typography.base_size, scale: typography.scale,
      fontHeadingSetting: setting("theme", "font_heading"), fontBodySetting: setting("theme", "font_body"),
    },
    buttons: settingJson("theme", "button_styles", {}),
    backgrounds: settingJson("theme", "background_colors", {}),
    logos: settingJson("theme", "logo_settings", {}),
    seoMeta,
    legacySettings: settings.map((s) => ({ section: s.section, key: s.key, value: s.value, type: s.type, isActive: s.is_active })),
  };
  write(path.join(OUT, CONTENT_FILES.theme), stringifyJson(theme));

  const navLabel = (name: string, url: string) => {
    const keyByUrl: Record<string, string> = { "/": "home", "/tours": "experiences", "/cruise": "cruise", "/custom-tour": "customTrip", "/blog": "blog", "/contact": "contact" };
    const k = keyByUrl[url];
    const l: Record<string, string> = { en: name };
    for (const lang of ["fr", "es"]) { const v = k && locales[lang]?.nav?.[k]; if (typeof v === "string") l[lang] = v; }
    return l;
  };
  const navigation = {
    logoUrl: setting("navigation", "logo_url") ?? "/media/brand/logo-amon.png",
    showSearch: (setting("navigation", "show_search") ?? "true") === "true",
    items: navItems.filter((n) => n.parent_id == null).map((n) => ({
      id: n.id, label: navLabel(n.name, n.url), url: n.url, order: n.display_order ?? 0, active: n.is_active ?? true,
      target: n.target === "_blank" ? "_blank" : "_self", iconName: n.icon_name ?? null, description: n.description ?? null,
      children: navItems.filter((c) => c.parent_id === n.id).map((c) => ({ id: c.id, label: navLabel(c.name, c.url), url: c.url, order: c.display_order ?? 0, active: c.is_active ?? true, target: c.target === "_blank" ? "_blank" : "_self" })),
    })),
  };
  write(path.join(OUT, CONTENT_FILES.navigation), stringifyJson(navigation));

  const newsletter = settingJson("footer", "footer_newsletter", {}) ?? {};
  const footer = {
    contactInfo: settingJson("footer", "footer_contact_info", []) ?? [],
    usefulLinks: settingJson("footer", "footer_useful_links", []) ?? [],
    socialMedia: settingJson("footer", "footer_social_media", []) ?? [],
    newsletter: { enabled: newsletter.enabled ?? true, title: newsletter.title ?? "Newsletter", description: newsletter.description ?? "", placeholder: newsletter.placeholder, buttonText: newsletter.buttonText, privacyText: newsletter.privacyText },
    copyright: settingJson("footer", "copyright_config", { text: "© Flame BB Co., Ltd. (Amon Tour). All rights reserved.", enabled: true }),
    legacySettings: {
      contact_info: settingJson("footer", "contact_info"), useful_links: settingJson("footer", "useful_links"), newsletter_config: settingJson("footer", "newsletter_config"),
    },
  };
  write(path.join(OUT, CONTENT_FILES.footer), stringifyJson(footer));

  const banner = settingJson("theme", "announcement_banner", {}) ?? {};
  const notif = settingJson("theme", "notification_bar", {}) ?? {};
  const announcements = {
    banner: { enabled: !!banner.enabled, text: banner.text ?? "", backgroundColor: banner.background_color, textColor: banner.text_color, linkUrl: banner.link_url, linkText: banner.link_text, closeable: banner.closeable },
    notificationBar: { enabled: !!notif.enabled, text: notif.text ?? "", scrolling: notif.scrolling, isClickable: notif.is_clickable, url: notif.url },
    popup: settingJson("theme", "popup_settings", {}),
  };
  write(path.join(OUT, CONTENT_FILES.announcements), stringifyJson(announcements));

  // ── Pages + sections ───────────────────────────────────────────────
  const COLUMN_PROPS: Record<string, string> = {
    title: "title", subtitle: "subtitle", description: "description", content: "content", image_url: "imageUrl", image_alt: "imageAlt",
    cta_text: "ctaText", cta_url: "ctaUrl", cta_style: "ctaStyle", icon_name: "iconName", background_color: "backgroundColor",
  };
  const sitemapMeta: Record<string, { changefreq: string; priority: number }> = {
    home: { changefreq: "daily", priority: 1.0 }, tours: { changefreq: "weekly", priority: 0.9 }, "custom-tour": { changefreq: "monthly", priority: 0.7 },
    blog: { changefreq: "weekly", priority: 0.6 }, contact: { changefreq: "monthly", priority: 0.5 }, "group-corporate": { changefreq: "monthly", priority: 0.5 },
    "become-partner": { changefreq: "monthly", priority: 0.4 }, "krabi-celebration": { changefreq: "monthly", priority: 0.6 }, brochure: { changefreq: "monthly", priority: 0.5 },
    "villas-krabi": { changefreq: "monthly", priority: 0.6 }, "privacy-policy": { changefreq: "yearly", priority: 0.3 }, "terms-conditions": { changefreq: "yearly", priority: 0.3 },
    "legal-notice": { changefreq: "yearly", priority: 0.3 }, cruise: { changefreq: "weekly", priority: 0.7 },
  };
  const pageBlockIds = new Set<number>();
  for (const pc of pageConfigs) {
    const isExternal = !!pc.is_external_url || /^https?:\/\//.test(pc.page_slug);
    const slug = isExternal ? (pc.page_name || "external").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") : pc.page_slug;
    const sections: Section[] = blocks.filter((b) => b.page_id === pc.id).map((b) => {
      pageBlockIds.add(b.id);
      const cfg = (b.configuration ?? {}) as Record<string, any>;
      const props: Record<string, any> = {};
      const differing: Record<string, any> = {};
      for (const [col, prop] of Object.entries(COLUMN_PROPS)) {
        const v = b[col];
        if (v == null || v === "") continue;
        if (prop in cfg && cfg[prop] !== v) differing[col] = v; else props[prop] = v;
      }
      Object.assign(props, cfg);
      const i18n: Record<string, any> = {};
      for (const lang of ["fr", "es"]) {
        const t = locales[lang]?.[`${b.block_type}_${b.id}`];
        if (t && typeof t === "object" && Object.keys(t).length) i18n[lang] = t;
      }
      const s: Section = {
        id: b.identifier, type: b.block_type, order: b.block_order ?? 0, active: b.is_active ?? true, props,
        ...(Object.keys(i18n).length ? { i18n } : {}),
        legacy: { blockId: b.id, createdAt: iso(b.created_at), updatedAt: iso(b.updated_at), ...(Object.keys(differing).length ? { columns: differing } : {}) },
      };
      return s;
    });
    // de-duplicate identifiers defensively (schema forbids duplicates)
    const seen = new Map<string, number>();
    for (const s of sections) { const n = seen.get(s.id) ?? 0; seen.set(s.id, n + 1); if (n) s.id = `${s.id}_${n}`; }

    const page: Page = {
      slug, path: isExternal ? `/${slug}` : pagePathFromSlug(pc.page_slug), name: pc.page_name.trim(), type: pc.page_type, active: pc.is_active ?? true,
      customCode: !!pc.is_custom_code, ...(isExternal ? { externalUrl: pc.page_slug } : {}),
      seo: { en: { ...(pc.seo_title ? { title: pc.seo_title } : {}), ...(pc.seo_description ? { description: pc.seo_description } : {}), ...(pc.seo_keywords ? { keywords: pc.seo_keywords } : {}) } },
      sections,
      sitemap: sitemapMeta[pc.page_slug] ? { include: !isExternal, ...sitemapMeta[pc.page_slug] } : { include: false },
      legacy: { pageId: pc.id, createdAt: iso(pc.created_at), updatedAt: iso(pc.updated_at) },
    } as Page;
    write(path.join(OUT, CONTENT_FILES.pagesDir, `${slug}.json`), stringifyJson(page));
  }
  // Orphan blocks (page deleted) are archived, never silently dropped
  const orphanBlocks = blocks.filter((b) => !pageBlockIds.has(b.id));

  // ── Destinations (programmatic SEO pages, previously hard-coded) ───
  const highPriority = ["agence-francophone-krabi", "koh-phi-phi", "phang-nga-bay", "sejour-famille-personnalise-thailande", "family-tailor-made-trip-thailand"];
  for (const d of DESTINATIONS as any[]) {
    write(path.join(OUT, CONTENT_FILES.destinationsDir, `${d.slug}.json`), stringifyJson({ ...d, sitemapPriority: highPriority.includes(d.slug) ? 0.9 : 0.8 }));
  }

  // ── Static pages (Markdown + front-matter) ─────────────────────────
  for (const sp of staticPages) {
    const meta = { slug: sp.slug, title: sp.title, ...(sp.meta_title ? { metaTitle: sp.meta_title } : {}), ...(sp.meta_description ? { metaDescription: sp.meta_description } : {}), published: sp.is_published ?? false, legacy: { id: sp.id, createdAt: iso(sp.created_at), updatedAt: iso(sp.updated_at) } };
    write(path.join(OUT, CONTENT_FILES.staticPagesDir, `${sp.slug}.md`), stringifyMarkdown(meta, sp.content ?? ""));
  }

  // ── Blog ───────────────────────────────────────────────────────────
  write(path.join(OUT, CONTENT_FILES.blogCategories), stringifyJson(blogCats.map((c) => ({ id: c.id, name: c.name, slug: c.slug, description: c.description ?? null }))));
  write(path.join(OUT, CONTENT_FILES.blogTags), stringifyJson(blogTags.map((t) => ({ id: t.id, name: t.name, slug: t.slug }))));
  const tagSlugById = new Map(blogTags.map((t) => [t.id, t.slug]));
  const catSlugById = new Map(blogCats.map((c) => [c.id, c.slug]));
  for (const p of blogPosts) {
    const tags = blogPostTags.filter((pt) => pt.post_id === p.id).map((pt) => tagSlugById.get(pt.tag_id)).filter(Boolean);
    const meta = {
      slug: p.slug, title: p.title, excerpt: p.excerpt ?? null, coverImage: p.cover_image ?? null, category: p.category_id ? catSlugById.get(p.category_id) ?? null : null,
      tags, status: p.status, publishDate: iso(p.publish_date) ?? null, authorName: p.author_name ?? null,
      legacy: { id: p.id, categoryId: p.category_id ?? null, createdAt: iso(p.created_at), updatedAt: iso(p.updated_at) },
    };
    write(path.join(OUT, CONTENT_FILES.blogPostsDir, `${p.slug}.md`), stringifyMarkdown(meta, p.content ?? ""));
  }

  // ── Forms ──────────────────────────────────────────────────────────
  for (const f of forms) {
    const doc = {
      id: f.id, name: f.name, title: f.title ?? "", subtitle: f.subtitle ?? null, description: f.description ?? null, headerImage: f.header_image ?? null,
      layout: f.layout ?? "single-column", formLayout: f.form_layout ?? null,
      colors: { backgroundColor: f.background_color ?? null, primaryColor: f.primary_color ?? null, textColor: f.text_color ?? null, frameColor: f.frame_color ?? null, titleColor: f.title_color ?? null, subtitleColor: f.subtitle_color ?? null },
      fields: parseMaybeJson(f.fields) ?? [], settings: parseMaybeJson(f.settings) ?? null, translations: parseMaybeJson(f.translations) ?? null, translationsMeta: parseMaybeJson(f.translations_meta) ?? null,
      active: f.is_active ?? true, submitTarget: "custom_tour_requests",
      legacy: { createdAt: iso(f.created_at), updatedAt: iso(f.updated_at) },
    };
    write(path.join(OUT, CONTENT_FILES.formsDir, `${f.id}.json`), stringifyJson(doc));
  }

  // ── Tour Ninja overrides / legacy tours / content blocks / templates
  write(path.join(OUT, CONTENT_FILES.imageOverrides), stringifyJson(overrides.map((o) => ({
    tourNinjaId: o.tour_ninja_id, tourName: o.tour_name, imageSourceType: o.image_source_type, customImageUrl: o.custom_image_url ?? null, directImageUrl: o.direct_image_url ?? null,
    originalImageUrl: o.original_image_url ?? null, active: o.is_active ?? true, legacy: { id: o.id, createdAt: iso(o.created_at), updatedAt: iso(o.updated_at) },
  }))));
  write(path.join(OUT, CONTENT_FILES.legacyTours), stringifyJson(legacyTours.map((t) => ({ id: t.id, title: t.title, description: t.description, shortDescription: t.short_description, duration: t.duration, price: t.price, childPrice: t.child_price ?? null, imageUrl: t.image_url, tourNinjaUrl: t.tour_ninja_url, featured: t.featured ?? false }))));
  write(path.join(OUT, CONTENT_FILES.contentBlocks), stringifyJson(contentBlocks.map((c) => ({ id: c.id, identifier: c.identifier, pageLocation: c.page_location, title: c.title, subtitle: c.subtitle, content: c.content, imageUrl: c.image_url, ctaText: c.cta_text, ctaUrl: c.cta_url, active: c.is_active, displayOrder: c.display_order }))));
  write(path.join(OUT, CONTENT_FILES.blockTemplates), stringifyJson(templates.map((t) => ({ id: t.id, templateName: t.template_name, blockType: t.block_type, defaultConfiguration: t.default_configuration ?? null, previewImage: t.preview_image ?? null, description: t.description ?? null, active: t.is_active }))));

  // ── Redirects (URL changes introduced by the migration) ────────────
  if (!fs.existsSync(path.join(OUT, CONTENT_FILES.redirects))) {
    write(path.join(OUT, CONTENT_FILES.redirects), stringifyJson([
      { from: "/tour-details/:id", to: "/tour-detail/:id", status: 301, note: "legacy alias kept by the SPA" },
      { from: "/booking", to: "/tours", status: 301, note: "Stripe booking flow retired; bookings go through Tour Ninja" },
      { from: "/cart", to: "/tours", status: 301, note: "cart retired; bookings go through Tour Ninja" },
      { from: "/payment-complete", to: "/tours", status: 301, note: "payment flow retired" },
    ]));
  }

  // ── Translations (full catalogs, verbatim) ─────────────────────────
  for (const lang of ["en", "fr", "es"]) write(path.join(OUT, CONTENT_FILES.translationsDir, `ui.${lang}.json`), stringifyJson(locales[lang]));

  // ── Media manifest ─────────────────────────────────────────────────
  const referenced = new Set<string>();
  const scan = (v: any) => {
    if (typeof v === "string") { for (const m of v.matchAll(/\/(uploads|attached_assets|media)\/[^\s"'()<>]+/g)) referenced.add(decodeURIComponent(m[0])); }
    else if (Array.isArray(v)) v.forEach(scan); else if (v && typeof v === "object") Object.values(v).forEach(scan);
  };
  scan({ pageConfigs, blocks, settings, staticPages, blogPosts, overrides, forms, contentBlocks, templates, navItems });
  const mediaItems: any[] = [];
  const addFile = (p: string, source: string, extra: Record<string, any> = {}) => {
    const abs = path.join(ROOT, p);
    const exists = fs.existsSync(abs) && fs.statSync(abs).isFile();
    const buf = exists ? fs.readFileSync(abs) : null;
    mediaItems.push({ path: p, filename: path.basename(p), ...(buf ? { fileSize: buf.length, sha256: sha256(buf) } : {}), source, ...extra, ...(exists ? {} : { missing: true }) });
  };
  for (const m of media) addFile(m.file_url, "media_library", { originalName: m.original_name, mimeType: m.mime_type, altText: m.alt_text ?? null, caption: m.caption ?? null, folder: m.folder ?? null, createdAt: iso(m.created_at) });
  const walk = (dir: string, source: string) => {
    const absDir = path.join(ROOT, dir);
    if (!fs.existsSync(absDir)) return;
    for (const e of fs.readdirSync(absDir, { withFileTypes: true })) {
      const rel = `${dir}/${e.name}`;
      if (e.isDirectory()) walk(rel, source); else addFile(`/${rel}`, source);
    }
  };
  walk("uploads", "uploads");
  const missingRefs = [...referenced].filter((r) => !fs.existsSync(path.join(ROOT, r)));
  const attachedRefs = [...referenced].filter((r) => r.startsWith("/attached_assets/") && fs.existsSync(path.join(ROOT, r)));
  for (const r of attachedRefs) addFile(r, "attached_assets");
  const manifestItems = mediaItems.filter((m) => !m.missing).map(({ missing, ...m }) => m);
  write(path.join(MEDIA_OUT, "manifest.json"), stringifyJson({ generatedAt: new Date().toISOString(), items: manifestItems }));
  write(path.join(MEDIA_OUT, "README.md"), `# Médias\n\nLes fichiers médias sont versionnés dans le dépôt :\n\n- \`/uploads/**\` — images téléversées via l'ancien back-office (surcharges d'images Tour Ninja, médiathèque)\n- \`/attached_assets/**\` — images/vidéos référencées par les pages, le blog et les paramètres\n- \`/media/uploads/**\` — nouveaux médias envoyés via le MCP (\`media_upload\`)\n\n\`manifest.json\` liste chaque fichier référencé (chemin, taille, sha256, source). Il est régénéré par \`scripts/migration/export-content.ts\` et mis à jour par le MCP à chaque upload.\n`);

  // ── Transactional archive ──────────────────────────────────────────
  const archived: Record<string, number> = {};
  for (const t of [...TRANSACTIONAL_TABLES, ...CMS_TABLES]) {
    if (!allTables.includes(t)) continue;
    const rows = await q(`select * from "${t}" order by 1`);
    const safeRows = t === "users" ? rows.map((r) => ({ ...r, password: "<redacted>" })) : rows;
    write(path.join(ARCHIVE, `${t}.json`), stringifyJson(safeRows));
    archived[t] = rows.length;
  }
  write(path.join(ARCHIVE, "orphan_page_blocks.json"), stringifyJson(orphanBlocks));

  // ── Validate the produced content tree ─────────────────────────────
  const content = loadContent(fsSource(OUT));

  // ── Inventory ──────────────────────────────────────────────────────
  const after = {
    "pages (content/pages)": content.pages.length,
    "sections (all pages)": content.pages.reduce((n, p) => n + p.sections.length, 0),
    "orphan blocks archived": orphanBlocks.length,
    "destinations": content.destinations.length,
    "static pages": content.staticPages.length,
    "blog posts": content.blog.posts.length, "blog categories": content.blog.categories.length, "blog tags": content.blog.tags.length,
    "blog post-tag links": content.blog.posts.reduce((n, p) => n + p.meta.tags.length, 0),
    forms: content.forms.length, "image overrides": content.imageOverrides.length, "legacy tours": content.legacyTours.length,
    "content blocks": content.contentBlocks.length, "block templates": content.blockTemplates.length,
    "navigation items": navigation.items.length + navigation.items.reduce((n, i) => n + (i.children?.length ?? 0), 0),
    "site settings (theme.legacySettings)": theme.legacySettings.length,
    "media manifest items": manifestItems.length, "media references missing on disk": missingRefs.length,
    "translation catalogs": 3,
  };
  const inventory = { exportedAt: new Date().toISOString(), source: connectionString!.replace(/:\/\/.*@/, "://***@"), dbCounts: counts, archivedRows: archived, contentCounts: after, missingMediaReferences: missingRefs, orphanBlocks: orphanBlocks.map((b) => b.id) };
  write(path.join(ARCHIVE, "inventory.json"), stringifyJson(inventory));

  const md = [
    `# Inventaire de migration — ${STAMP}`, "",
    `Source : \`${inventory.source}\` (lecture seule). Archive : \`exports/archive/${STAMP}/\`.`, "",
    "## Comptages par table (base de données → export)", "", "| Table | Lignes en base | Lignes archivées | Destination Git |", "|---|---:|---:|---|",
    ...allTables.map((t) => `| ${t} | ${counts[t]} | ${archived[t] ?? "—"} | ${destinationFor(t)} |`), "",
    "## Comptages du modèle de contenu généré", "", "| Élément | Nombre |", "|---|---:|",
    ...Object.entries(after).map(([k, v]) => `| ${k} | ${v} |`), "",
    "## Vérifications", "",
    `- page_configurations ${counts.page_configurations} → pages ${after["pages (content/pages)"]} ${counts.page_configurations === after["pages (content/pages)"] ? "✅" : "❌"}`,
    `- page_blocks ${counts.page_blocks} → sections ${after["sections (all pages)"]} + orphelins ${orphanBlocks.length} ${counts.page_blocks === after["sections (all pages)"] + orphanBlocks.length ? "✅" : "❌"}`,
    `- blog_posts ${counts.blog_posts} → ${after["blog posts"]} ${counts.blog_posts === after["blog posts"] ? "✅" : "❌"}`,
    `- blog_post_tags ${counts.blog_post_tags} → ${after["blog post-tag links"]} ${counts.blog_post_tags === after["blog post-tag links"] ? "✅" : "❌"}`,
    `- static_pages ${counts.static_pages} → ${after["static pages"]} ${counts.static_pages === after["static pages"] ? "✅" : "❌"}`,
    `- custom_forms ${counts.custom_forms} → ${after.forms} ${counts.custom_forms === after.forms ? "✅" : "❌"}`,
    `- tour_ninja_image_overrides ${counts.tour_ninja_image_overrides} → ${after["image overrides"]} ${counts.tour_ninja_image_overrides === after["image overrides"] ? "✅" : "❌"}`,
    `- navigation_menu_items ${counts.navigation_menu_items} → ${after["navigation items"]} ${counts.navigation_menu_items === after["navigation items"] ? "✅" : "❌"}`,
    `- site_settings ${counts.site_settings} → ${after["site settings (theme.legacySettings)"]} ${counts.site_settings === after["site settings (theme.legacySettings)"] ? "✅" : "❌"}`,
    `- Références médias introuvables sur disque : ${missingRefs.length}${missingRefs.length ? "\n" + missingRefs.map((m) => `  - ${m}`).join("\n") : ""}`,
    "",
    "> Note médias : les 14 fichiers `/uploads/tours/tour-17609292…` référencés par `tour_ninja_image_overrides` renvoient déjà la page 404 (HTML) sur https://amon-tour.com au moment de l'export — ils avaient été téléversés sur le système de fichiers éphémère du déploiement et n'ont jamais été versionnés. La migration n'introduit donc aucune perte : les enregistrements de surcharge sont conservés dans `content/tour-ninja/image-overrides.json` et peuvent être ré-alimentés via l'outil MCP `set_tour_image_override` + `upload_media`. `/attached_assets/logo.png`, `hero-bg.jpg`, `about-img.jpg` sont d'anciennes références (`content_blocks`, paramètres legacy) non utilisées par le rendu actuel.",
    "",
    "Les tables transactionnelles (demandes, messages, newsletter, réservations, soumissions) sont archivées en JSON dans `exports/archive/` et restent servies par le mini-backend `edge/` (routes `/api/sync/*`).",
    "",
  ].join("\n");
  write(path.join(ROOT, "docs/migration/INVENTAIRE.md"), md);

  console.log(JSON.stringify({ counts, archived, after, missingRefs: missingRefs.length, orphanBlocks: orphanBlocks.length }, null, 2));
  await pool.end();
}

function destinationFor(t: string): string {
  const map: Record<string, string> = {
    page_configurations: "content/pages/*.json", page_blocks: "content/pages/*.json (sections)", page_block_history: "archive (historique)", block_templates: "content/block-templates.json",
    navigation_menu_items: "content/navigation.json", site_settings: "content/theme.json + footer.json + announcements.json + site.json", static_pages: "content/static-pages/*.md",
    blog_posts: "content/blog/posts/*.md", blog_categories: "content/blog/categories.json", blog_tags: "content/blog/tags.json", blog_post_tags: "front-matter `tags`",
    media_library: "media/manifest.json", tour_ninja_image_overrides: "content/tour-ninja/image-overrides.json", custom_forms: "content/forms/*.json", content_blocks: "content/content-blocks.json",
    tours: "content/tour-ninja/legacy-tours.json", tour_cards: "archive", session: "— (sessions volatiles)",
  };
  return map[t] ?? "archive JSON (transactionnel)";
}

main().catch((e) => { console.error(e); process.exit(1); });
