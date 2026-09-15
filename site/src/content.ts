/**
 * Content loader + validator shared by the generator, the edge server and the MCP server.
 *
 * Content can come from the local checkout (`fsSource`) or from an in-memory map
 * (`memorySource`) — the latter is used by the MCP server to preview uncommitted edits
 * and by the edge server when it syncs `content/` straight from GitHub.
 */
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { z } from "zod";
import {
  AnnouncementsSchema, BlockTemplateSchema, BlogCategorySchema, BlogPostFrontMatterSchema, BlogTagSchema,
  CONTENT_FILES, CustomFormSchema, DestinationPageSchema, FooterSchema, LegacyContentBlockSchema, LegacyTourSchema,
  NavigationSchema, PageSchema, RedirectSchema, SiteConfigSchema, StaticPageFrontMatterSchema, ThemeSchema,
  TourNinjaImageOverrideSchema, TranslationCatalogSchema, LANGUAGES,
  type Announcements, type BlogPostFrontMatter, type CustomForm, type DestinationPage, type Footer, type Language,
  type Navigation, type Page, type Redirect, type SiteConfig, type StaticPageFrontMatter, type Theme,
  type TourNinjaImageOverride,
} from "./schema.js";

export interface FileSource {
  /** List file paths (relative to content root, posix separators) under a prefix. */
  list(prefix: string): string[];
  read(relPath: string): string;
  exists(relPath: string): boolean;
}

export function fsSource(rootDir: string): FileSource {
  const abs = (p: string) => path.join(rootDir, p);
  return {
    list(prefix) {
      const dir = abs(prefix);
      if (!fs.existsSync(dir)) return [];
      const out: string[] = [];
      const walk = (d: string) => {
        for (const e of fs.readdirSync(d, { withFileTypes: true })) {
          const full = path.join(d, e.name);
          if (e.isDirectory()) walk(full);
          else out.push(path.relative(rootDir, full).split(path.sep).join("/"));
        }
      };
      walk(dir);
      return out.sort();
    },
    read(p) { return fs.readFileSync(abs(p), "utf8"); },
    exists(p) { return fs.existsSync(abs(p)); },
  };
}

export function memorySource(files: Map<string, string>): FileSource {
  return {
    list(prefix) {
      const pre = prefix.endsWith("/") ? prefix : prefix + "/";
      return [...files.keys()].filter((k) => k.startsWith(pre)).sort();
    },
    read(p) {
      const v = files.get(p);
      if (v === undefined) throw new Error(`content file not found: ${p}`);
      return v;
    },
    exists(p) { return files.has(p); },
  };
}

/** Layer an in-memory overlay (edits) on top of a base source. `null` values delete files. */
export function overlaySource(base: FileSource, overlay: Map<string, string | null>): FileSource {
  return {
    list(prefix) {
      const pre = prefix.endsWith("/") ? prefix : prefix + "/";
      const set = new Set(base.list(prefix));
      for (const [k, v] of overlay) {
        if (!k.startsWith(pre)) continue;
        if (v === null) set.delete(k); else set.add(k);
      }
      return [...set].sort();
    },
    read(p) {
      if (overlay.has(p)) {
        const v = overlay.get(p);
        if (v === null) throw new Error(`content file deleted: ${p}`);
        return v as string;
      }
      return base.read(p);
    },
    exists(p) {
      if (overlay.has(p)) return overlay.get(p) !== null;
      return base.exists(p);
    },
  };
}

export class ContentValidationError extends Error {
  constructor(public file: string, public issues: z.ZodIssue[]) {
    super(`${file}: ` + issues.map((i) => `${i.path.join(".") || "(root)"}: ${i.message}`).join("; "));
    this.name = "ContentValidationError";
  }
}

function parseJson<S extends z.ZodTypeAny>(src: FileSource, file: string, schema: S): z.output<S> {
  let raw: unknown;
  try { raw = JSON.parse(src.read(file)); } catch (e) { throw new Error(`${file}: invalid JSON (${(e as Error).message})`); }
  const r = schema.safeParse(raw);
  if (!r.success) throw new ContentValidationError(file, r.error.issues);
  return r.data;
}

function parseMarkdown<S extends z.ZodTypeAny>(src: FileSource, file: string, schema: S): { meta: z.output<S>; body: string } {
  const { data, content } = matter(src.read(file));
  const r = schema.safeParse(data);
  if (!r.success) throw new ContentValidationError(file, r.error.issues);
  return { meta: r.data, body: content };
}

export interface StaticPageDoc { meta: StaticPageFrontMatter; body: string; file: string }
export interface BlogPostDoc { meta: BlogPostFrontMatter; body: string; file: string }

export interface SiteContent {
  site: SiteConfig;
  theme: Theme;
  navigation: Navigation;
  footer: Footer;
  announcements: Announcements;
  redirects: Redirect[];
  pages: Page[];
  destinations: DestinationPage[];
  staticPages: StaticPageDoc[];
  blog: { posts: BlogPostDoc[]; categories: z.infer<typeof BlogCategorySchema>[]; tags: z.infer<typeof BlogTagSchema>[] };
  forms: CustomForm[];
  imageOverrides: TourNinjaImageOverride[];
  legacyTours: z.infer<typeof LegacyTourSchema>[];
  contentBlocks: z.infer<typeof LegacyContentBlockSchema>[];
  blockTemplates: z.infer<typeof BlockTemplateSchema>[];
  translations: Record<Language, Record<string, any>>;
}

/** Load and validate the whole content tree. Throws ContentValidationError on the first invalid file. */
export function loadContent(src: FileSource): SiteContent {
  const site = parseJson(src, CONTENT_FILES.site, SiteConfigSchema);
  const theme = parseJson(src, CONTENT_FILES.theme, ThemeSchema);
  const navigation = parseJson(src, CONTENT_FILES.navigation, NavigationSchema);
  const footer = parseJson(src, CONTENT_FILES.footer, FooterSchema);
  const announcements = parseJson(src, CONTENT_FILES.announcements, AnnouncementsSchema);
  const redirects = src.exists(CONTENT_FILES.redirects) ? parseJson(src, CONTENT_FILES.redirects, z.array(RedirectSchema)) : [];

  const pages = src.list(CONTENT_FILES.pagesDir).filter((f) => f.endsWith(".json")).map((f) => {
    const p = parseJson(src, f, PageSchema);
    const expected = `${CONTENT_FILES.pagesDir}/${p.slug}.json`;
    if (f !== expected) throw new ContentValidationError(f, [{ code: "custom", path: ["slug"], message: `file name must match slug (${expected})` } as z.ZodIssue]);
    return p;
  });
  const seenPaths = new Set<string>();
  for (const p of pages) {
    if (p.externalUrl) continue;
    if (seenPaths.has(p.path)) throw new ContentValidationError(`pages/${p.slug}.json`, [{ code: "custom", path: ["path"], message: `duplicate page path ${p.path}` } as z.ZodIssue]);
    seenPaths.add(p.path);
  }

  const destinations = src.list(CONTENT_FILES.destinationsDir).filter((f) => f.endsWith(".json")).map((f) => parseJson(src, f, DestinationPageSchema));
  const staticPages = src.list(CONTENT_FILES.staticPagesDir).filter((f) => f.endsWith(".md")).map((f) => ({ ...parseMarkdown(src, f, StaticPageFrontMatterSchema), file: f }));

  const categories = src.exists(CONTENT_FILES.blogCategories) ? parseJson(src, CONTENT_FILES.blogCategories, z.array(BlogCategorySchema)) : [];
  const tags = src.exists(CONTENT_FILES.blogTags) ? parseJson(src, CONTENT_FILES.blogTags, z.array(BlogTagSchema)) : [];
  const posts = src.list(CONTENT_FILES.blogPostsDir).filter((f) => f.endsWith(".md")).map((f) => ({ ...parseMarkdown(src, f, BlogPostFrontMatterSchema), file: f }));
  const catSlugs = new Set(categories.map((c) => c.slug));
  const tagSlugs = new Set(tags.map((t) => t.slug));
  const postSlugs = new Set<string>();
  for (const p of posts) {
    if (postSlugs.has(p.meta.slug)) throw new ContentValidationError(p.file, [{ code: "custom", path: ["slug"], message: "duplicate blog slug" } as z.ZodIssue]);
    postSlugs.add(p.meta.slug);
    if (p.meta.category && !catSlugs.has(p.meta.category)) throw new ContentValidationError(p.file, [{ code: "custom", path: ["category"], message: `unknown category ${p.meta.category}` } as z.ZodIssue]);
    for (const t of p.meta.tags) if (!tagSlugs.has(t)) throw new ContentValidationError(p.file, [{ code: "custom", path: ["tags"], message: `unknown tag ${t}` } as z.ZodIssue]);
  }

  const forms = src.list(CONTENT_FILES.formsDir).filter((f) => f.endsWith(".json")).map((f) => parseJson(src, f, CustomFormSchema));
  const imageOverrides = src.exists(CONTENT_FILES.imageOverrides) ? parseJson(src, CONTENT_FILES.imageOverrides, z.array(TourNinjaImageOverrideSchema)) : [];
  const legacyTours = src.exists(CONTENT_FILES.legacyTours) ? parseJson(src, CONTENT_FILES.legacyTours, z.array(LegacyTourSchema)) : [];
  const contentBlocks = src.exists(CONTENT_FILES.contentBlocks) ? parseJson(src, CONTENT_FILES.contentBlocks, z.array(LegacyContentBlockSchema)) : [];
  const blockTemplates = src.exists(CONTENT_FILES.blockTemplates) ? parseJson(src, CONTENT_FILES.blockTemplates, z.array(BlockTemplateSchema)) : [];

  const translations = {} as Record<Language, Record<string, any>>;
  for (const lang of LANGUAGES) {
    const f = `${CONTENT_FILES.translationsDir}/ui.${lang}.json`;
    translations[lang] = src.exists(f) ? parseJson(src, f, TranslationCatalogSchema) : {};
  }

  // Cross-checks: form references from sections
  const formIds = new Set(forms.map((f) => String(f.id)));
  for (const p of pages) for (const s of p.sections) {
    if (s.props.formId !== undefined && s.props.formId !== "" && !formIds.has(String(s.props.formId))) {
      throw new ContentValidationError(`pages/${p.slug}.json`, [{ code: "custom", path: ["sections", s.id, "props", "formId"], message: `unknown form ${s.props.formId}` } as z.ZodIssue]);
    }
  }

  return { site, theme, navigation, footer, announcements, redirects, pages, destinations, staticPages, blog: { posts, categories, tags }, forms, imageOverrides, legacyTours, contentBlocks, blockTemplates, translations };
}

/** Serialise helpers so every writer (export script, MCP) produces byte-identical formatting. */
export function stringifyJson(value: unknown): string {
  return JSON.stringify(value, null, 2) + "\n";
}
export function stringifyMarkdown(meta: Record<string, unknown>, body: string): string {
  return matter.stringify(body.endsWith("\n") ? body : body + "\n", meta);
}

/** Validate a content tree and return a report instead of throwing (used by CI and the MCP `validate_content` tool). */
export function validateContent(src: FileSource): { ok: true; content: SiteContent } | { ok: false; error: string; file?: string } {
  try {
    return { ok: true, content: loadContent(src) };
  } catch (e) {
    if (e instanceof ContentValidationError) return { ok: false, error: e.message, file: e.file };
    return { ok: false, error: (e as Error).message };
  }
}
