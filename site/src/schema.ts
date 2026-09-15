/**
 * Amon Tour — Git content model (single source of truth).
 *
 * Every file under `content/` is validated with these schemas by:
 *   - the export script (DB -> content/),
 *   - the static site generator (content/ -> HTML),
 *   - the MCP CMS server (every write is validated before it is committed),
 *   - the CI pipeline (`npm run content:validate`).
 *
 * Layout of the repository content:
 *   content/site.json                 SiteConfig    (brand, languages, contact, hreflang)
 *   content/theme.json                Theme         (colors, fonts, buttons, logos)
 *   content/navigation.json           Navigation    (header menu + logo)
 *   content/footer.json               Footer        (contact info, links, social, newsletter, copyright)
 *   content/announcements.json        Announcements (banner / notification bar / popup)
 *   content/redirects.json            Redirect[]    (301/302 rules)
 *   content/pages/<slug>.json         Page          (dynamic CMS pages: sections + SEO per language)
 *   content/destinations/<slug>.json  DestinationPage (programmatic SEO landing pages)
 *   content/static-pages/<slug>.md    StaticPage    (front-matter + HTML body)
 *   content/blog/posts/<slug>.md      BlogPost      (front-matter + HTML body)
 *   content/blog/categories.json      BlogCategory[]
 *   content/blog/tags.json            BlogTag[]
 *   content/forms/<id>.json           CustomForm
 *   content/tour-ninja/image-overrides.json  TourNinjaImageOverride[]
 *   content/tour-ninja/legacy-tours.json     LegacyTour[] (the 3 legacy DB tours used by /tour-detail/:id)
 *   content/content-blocks.json       LegacyContentBlock[]
 *   content/block-templates.json      BlockTemplate[]
 *   content/translations/ui.<lang>.json  UI + dynamic block translations (per language)
 *   media/manifest.json               MediaManifest (media library + files referenced from content)
 */
import { z } from "zod";

/* ─────────────────────────── Primitives ─────────────────────────── */

export const LANGUAGES = ["en", "fr", "es"] as const;
export const LanguageSchema = z.enum(LANGUAGES);
export type Language = z.infer<typeof LanguageSchema>;

/** Slug used in file names and URLs. */
export const SlugSchema = z
  .string()
  .min(1)
  .max(200)
  .regex(/^[a-z0-9][a-z0-9-]*$/, "slug must be lowercase letters, digits and dashes");

/** A site-relative path such as "/tours" or an absolute http(s) URL. */
export const UrlSchema = z
  .string()
  .max(2000)
  .refine(
    (v) => v === "" || v.startsWith("/") || v.startsWith("#") || /^https?:\/\//i.test(v) || /^(mailto|tel):/i.test(v),
    "url must be site-relative (/...) or absolute http(s)/mailto/tel",
  );

/** A media reference: repo path (/uploads/..., /attached_assets/..., /media/...) or absolute https URL. */
export const MediaRefSchema = z
  .string()
  .max(2000)
  .refine(
    (v) => v === "" || v.startsWith("/") || /^https?:\/\//i.test(v) || v.startsWith("data:"),
    "media reference must be a repo path or an absolute URL",
  );

export const HexColorSchema = z.string().regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/);
export const CssColorSchema = z.string().max(120); // hex, rgb(), hsl(var(--x)), gradients are allowed in configs
export const IsoDateSchema = z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}/));

/** Text per language. `en` is mandatory (canonical), other languages optional. */
export const LocalizedStringSchema = z
  .object({ en: z.string(), fr: z.string().optional(), es: z.string().optional() })
  .strict();
export type LocalizedString = z.infer<typeof LocalizedStringSchema>;

/* ─────────────────────────── SEO ─────────────────────────── */

export const SeoEntrySchema = z
  .object({
    title: z.string().max(200).optional(),
    description: z.string().max(500).optional(),
    keywords: z.string().max(500).optional(),
    ogImage: MediaRefSchema.optional(),
    canonical: UrlSchema.optional(),
    noindex: z.boolean().optional(),
    h1: z.string().max(200).optional(),
  })
  .strict();
export type SeoEntry = z.infer<typeof SeoEntrySchema>;

/** SEO per language: `en` is used for the canonical page; fr/es override when the UI language differs. */
export const SeoSchema = z
  .object({ en: SeoEntrySchema, fr: SeoEntrySchema.optional(), es: SeoEntrySchema.optional() })
  .strict();
export type Seo = z.infer<typeof SeoSchema>;

/* ─────────────────────────── Sections (blocks) ─────────────────────────── */

/** Block types that exist in the current CMS (`block_type` enum) — kept verbatim for zero-loss export. */
export const SECTION_TYPES = [
  "header_page", "hero", "hero_banner", "hero_video",
  "text", "text_section", "text_image", "about_2col",
  "cta_banner", "cta_section",
  "contact_info", "contact_cards", "contact",
  "form", "custom_form", "dynamic_form", "custom_tour_form",
  "advantages", "card_grid", "cards_grid",
  "popular_experiences", "tour_ninja_section",
  "why_choose_us", "who_we_are", "search_bar_tours", "blog_search",
  "text_gallery", "text_video", "text_listing", "text_pricing",
  // declared in the enum but without a renderer today (kept for data fidelity)
  "tour_grid", "search_bar", "search_module", "features_3col", "testimonials", "map_section",
  "gallery", "video_section", "video_hero", "newsletter", "social_media", "pdf_download",
  "interests", "expats_welcome",
] as const;
export const SectionTypeSchema = z.enum(SECTION_TYPES);
export type SectionType = z.infer<typeof SectionTypeSchema>;

export const ButtonSchema = z
  .object({
    text: z.string().max(200),
    url: UrlSchema,
    style: z.string().max(40).optional(),
    color: CssColorSchema.optional(),
    textColor: CssColorSchema.optional(),
    target: z.enum(["_self", "_blank"]).optional(),
  })
  .passthrough();

/**
 * Section properties. The legacy `configuration` JSON is heterogeneous per block type,
 * so the schema types the shared/known keys and keeps unknown keys (passthrough) to
 * guarantee no data loss. Type-specific renderers read what they need.
 */
export const SectionPropsSchema = z
  .object({
    title: z.string().optional(),
    subtitle: z.string().optional(),
    description: z.string().optional(),
    content: z.string().optional(), // HTML allowed (rendered as-is, sanitised at build time)
    imageUrl: MediaRefSchema.optional(),
    imageAlt: z.string().optional(),
    videoUrl: MediaRefSchema.optional(),
    backgroundImage: MediaRefSchema.optional(),
    backgroundType: z.string().optional(),
    backgroundColor: CssColorSchema.optional(),
    titleColor: CssColorSchema.optional(),
    subtitleColor: CssColorSchema.optional(),
    dividerColor: CssColorSchema.optional(),
    contentColor: CssColorSchema.optional(),
    textColor: CssColorSchema.optional(),
    buttons: z.array(ButtonSchema).optional(),
    buttonText: z.string().optional(),
    buttonUrl: UrlSchema.optional(),
    ctaText: z.string().optional(),
    ctaUrl: UrlSchema.optional(),
    ctaStyle: z.string().optional(),
    iconName: z.string().optional(),
    formId: z.union([z.number().int(), z.string()]).optional(),
    // Tour Ninja catalogue sections
    categoryFilter: z.string().optional(),
    selectedTourIds: z.array(z.string()).optional(),
    showAllAds: z.boolean().optional(),
    displayCountDesktop: z.number().int().optional(),
    displayCountTablet: z.number().int().optional(),
    displayCountMobile: z.number().int().optional(),
  })
  .passthrough();
export type SectionProps = z.infer<typeof SectionPropsSchema>;

export const SectionSchema = z
  .object({
    /** Stable identifier (legacy `identifier`, e.g. "hero_1760097856557"). Used as translation key suffix. */
    id: z.string().min(1).max(120).regex(/^[a-zA-Z0-9_-]+$/),
    type: SectionTypeSchema,
    order: z.number().int(),
    active: z.boolean().default(true),
    /** Canonical (English) properties — merged legacy columns + `configuration` JSON. */
    props: SectionPropsSchema,
    /**
     * Optional per-language overrides of any prop (fr/es).
     * Keys may be camelCase props (title, subtitle, ctaText…) or the legacy translation-catalog
     * keys (`cta_text`, `button_0_text`, `feature_1_title`…). The renderer normalises both.
     */
    i18n: z
      .object({ fr: SectionPropsSchema.partial().optional(), es: SectionPropsSchema.partial().optional() })
      .strict()
      .optional(),
    /** Legacy DB metadata kept for traceability (never required). */
    legacy: z
      .object({
        blockId: z.number().int().optional(),
        createdAt: z.string().optional(),
        updatedAt: z.string().optional(),
        /** Original DB column values when they differed from `configuration` (zero-loss export). */
        columns: z.record(z.any()).optional(),
      })
      .partial()
      .optional(),
  })
  .strict();
export type Section = z.infer<typeof SectionSchema>;

/* ─────────────────────────── Pages ─────────────────────────── */

export const PAGE_TYPES = ["main", "secondary", "legal", "system"] as const;

export const PageSchema = z
  .object({
    slug: SlugSchema,
    /** Public path, e.g. "/" for home, "/tours". */
    path: z.string().regex(/^\/[a-z0-9\-\/]*$/),
    name: z.string().min(1).max(120),
    type: z.enum(PAGE_TYPES),
    active: z.boolean().default(true),
    /**
     * `custom_code` pages are rendered by a hand-written template (krabi-celebration,
     * become-partner, group-corporate, brochure, villas-krabi) in site/src/templates/custom/.
     */
    customCode: z.boolean().default(false),
    /** External link entries (navigation-only pages) are not rendered. */
    externalUrl: z.string().url().optional(),
    seo: SeoSchema,
    sections: z.array(SectionSchema).default([]),
    /** Sitemap tuning. */
    sitemap: z
      .object({
        include: z.boolean().default(true),
        changefreq: z.enum(["always", "hourly", "daily", "weekly", "monthly", "yearly", "never"]).optional(),
        priority: z.number().min(0).max(1).optional(),
      })
      .strict()
      .optional(),
    legacy: z
      .object({ pageId: z.number().int().optional(), createdAt: z.string().optional(), updatedAt: z.string().optional() })
      .partial()
      .optional(),
  })
  .strict()
  .superRefine((page, ctx) => {
    const ids = new Set<string>();
    page.sections.forEach((s, i) => {
      if (ids.has(s.id)) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["sections", i, "id"], message: `duplicate section id "${s.id}"` });
      ids.add(s.id);
    });
  });
export type Page = z.infer<typeof PageSchema>;

/* ─────────────────────────── Destination landing pages ─────────────────────────── */

export const DestinationPageSchema = z
  .object({
    slug: SlugSchema,
    lang: z.enum(["fr", "en", "both"]),
    title: z.string(),
    metaDescription: z.string(),
    h1: z.string(),
    intro: z.string(),
    sections: z.array(z.object({ heading: z.string(), content: z.string() }).strict()),
    faq: z.array(z.object({ question: z.string(), answer: z.string() }).strict()),
    relatedSlugs: z.array(SlugSchema),
    schema: z.record(z.any()),
    tripSchema: z.record(z.any()),
    sitemapPriority: z.number().min(0).max(1).default(0.8),
  })
  .strict();
export type DestinationPage = z.infer<typeof DestinationPageSchema>;

/* ─────────────────────────── Static pages & blog (Markdown front-matter) ─────────────────────────── */

export const StaticPageFrontMatterSchema = z
  .object({
    slug: SlugSchema,
    title: z.string(),
    metaTitle: z.string().optional(),
    metaDescription: z.string().optional(),
    published: z.boolean().default(true),
    legacy: z.object({ id: z.number().int().optional(), createdAt: z.string().optional(), updatedAt: z.string().optional() }).partial().optional(),
  })
  .strict();
export type StaticPageFrontMatter = z.infer<typeof StaticPageFrontMatterSchema>;

export const BlogCategorySchema = z
  .object({ id: z.number().int(), name: z.string(), slug: SlugSchema, description: z.string().nullable().optional() })
  .strict();
export const BlogTagSchema = z.object({ id: z.number().int(), name: z.string(), slug: SlugSchema }).strict();

export const BlogPostFrontMatterSchema = z
  .object({
    slug: SlugSchema,
    title: z.string(),
    excerpt: z.string().nullable().optional(),
    coverImage: MediaRefSchema.nullable().optional(),
    category: SlugSchema.nullable().optional(), // category slug
    tags: z.array(SlugSchema).default([]),
    status: z.enum(["draft", "published", "archived"]),
    publishDate: z.string().nullable().optional(),
    authorName: z.string().nullable().optional(),
    seo: SeoSchema.optional(),
    legacy: z.object({ id: z.number().int().optional(), categoryId: z.number().int().nullable().optional(), createdAt: z.string().optional(), updatedAt: z.string().optional() }).partial().optional(),
  })
  .strict();
export type BlogPostFrontMatter = z.infer<typeof BlogPostFrontMatterSchema>;

/* ─────────────────────────── Navigation / footer / theme / announcements ─────────────────────────── */

export const NavItemSchema: z.ZodType<any> = z.lazy(() =>
  z
    .object({
      id: z.number().int().optional(),
      label: LocalizedStringSchema,
      url: UrlSchema,
      order: z.number().int().default(0),
      active: z.boolean().default(true),
      target: z.enum(["_self", "_blank"]).default("_self"),
      iconName: z.string().nullable().optional(),
      description: z.string().nullable().optional(),
      children: z.array(NavItemSchema).optional(),
    })
    .strict(),
);

export const NavigationSchema = z
  .object({
    logoUrl: MediaRefSchema,
    showSearch: z.boolean().default(true),
    items: z.array(NavItemSchema),
  })
  .strict();
export type Navigation = z.infer<typeof NavigationSchema>;

export const FooterSchema = z
  .object({
    contactInfo: z.array(z.object({ label: z.string(), value: z.string(), style: z.string().optional() }).passthrough()),
    usefulLinks: z.array(z.object({ text: z.string(), url: z.string(), isPage: z.boolean().optional() }).passthrough()),
    socialMedia: z.array(z.object({ name: z.string(), url: z.string().url(), icon: z.string() }).passthrough()),
    newsletter: z
      .object({
        enabled: z.boolean().default(true),
        title: z.string(),
        description: z.string(),
        placeholder: z.string().optional(),
        buttonText: z.string().optional(),
        privacyText: z.string().optional(),
      })
      .passthrough(),
    copyright: z.object({ text: z.string(), enabled: z.boolean().default(true) }).passthrough(),
    /** Legacy duplicated `text` settings rows, preserved verbatim. */
    legacySettings: z.record(z.any()).optional(),
  })
  .strict();
export type Footer = z.infer<typeof FooterSchema>;

export const ThemeSchema = z
  .object({
    colors: z
      .object({
        primary: CssColorSchema,
        secondary: CssColorSchema,
        background: CssColorSchema.optional(),
        text: CssColorSchema.optional(),
        textLight: CssColorSchema.optional(),
        border: CssColorSchema.optional(),
        backgroundFooter: CssColorSchema.optional(),
        textFooter: CssColorSchema.optional(),
      })
      .passthrough(),
    typography: z
      .object({
        headingFont: z.string(),
        bodyFont: z.string(),
        accentFont: z.string().optional(),
        headingWeight: z.string().optional(),
        bodyWeight: z.string().optional(),
        baseSize: z.string().optional(),
        scale: z.string().optional(),
      })
      .passthrough(),
    buttons: z.record(z.any()).optional(),
    backgrounds: z.record(z.any()).optional(),
    logos: z.record(z.any()).optional(),
    seoMeta: z.record(z.any()).optional(),
    /** Every legacy `site_settings` row (section/key/value/type) preserved verbatim. */
    legacySettings: z.array(z.object({ section: z.string(), key: z.string(), value: z.string().nullable(), type: z.string(), isActive: z.boolean().nullable().optional() }).strict()).optional(),
  })
  .strict();
export type Theme = z.infer<typeof ThemeSchema>;

export const AnnouncementsSchema = z
  .object({
    banner: z
      .object({
        enabled: z.boolean(),
        text: z.string(),
        backgroundColor: CssColorSchema.optional(),
        textColor: CssColorSchema.optional(),
        linkUrl: z.string().optional(),
        linkText: z.string().optional(),
        closeable: z.boolean().optional(),
      })
      .passthrough(),
    notificationBar: z
      .object({ enabled: z.boolean(), text: z.string(), scrolling: z.boolean().optional(), isClickable: z.boolean().optional(), url: z.string().optional() })
      .passthrough(),
    popup: z.record(z.any()).optional(),
  })
  .strict();
export type Announcements = z.infer<typeof AnnouncementsSchema>;

/* ─────────────────────────── Site config ─────────────────────────── */

export const SiteConfigSchema = z
  .object({
    name: z.string(),
    baseUrl: z.string().url(),
    languages: z.array(LanguageSchema).min(1),
    defaultLanguage: LanguageSchema,
    /** Full hreflang list emitted on every page (kept identical to the current site). */
    hreflangLocales: z.array(z.string()),
    title: z.string(),
    description: z.string(),
    brand: z
      .object({
        primary: HexColorSchema,
        primaryDark: HexColorSchema,
        gold: HexColorSchema,
        logo: MediaRefSchema,
        phone: z.string(),
        phoneIntl: z.string(),
        whatsapp: z.string(),
        whatsappIntl: z.string(),
        email: z.string().email(),
        addressLine1: z.string(),
        addressLine2: z.string(),
        lineId: z.string().optional(),
      })
      .strict(),
    social: z.array(z.string().url()).default([]),
    organization: z.record(z.any()).optional(),
    /** Tour Ninja connectivity (public showcase identifiers; NOT secrets). */
    tourNinja: z
      .object({
        baseUrl: z.string().url().default("https://www.tourninja.io"),
        companyId: z.string().default("2"),
        showcaseKey: z.string().default("tourninja-showcase-2-amontour"),
        catalogueCacheTtlHours: z.number().default(24),
      })
      .strict(),
  })
  .strict();
export type SiteConfig = z.infer<typeof SiteConfigSchema>;

/* ─────────────────────────── Redirects ─────────────────────────── */

export const RedirectSchema = z
  .object({ from: z.string().startsWith("/"), to: z.string().min(1), status: z.union([z.literal(301), z.literal(302)]).default(301), note: z.string().optional() })
  .strict();
export type Redirect = z.infer<typeof RedirectSchema>;

/* ─────────────────────────── Forms ─────────────────────────── */

export const CustomFormSchema = z
  .object({
    id: z.number().int(),
    name: z.string(),
    title: z.string(),
    subtitle: z.string().nullable().optional(),
    description: z.string().nullable().optional(),
    headerImage: MediaRefSchema.nullable().optional(),
    layout: z.string(),
    formLayout: z.string().nullable().optional(),
    colors: z.record(z.string().nullable()).optional(),
    fields: z.array(z.record(z.any())),
    settings: z.record(z.any()).nullable().optional(),
    translations: z.record(z.record(z.any())).nullable().optional(),
    translationsMeta: z.record(z.any()).nullable().optional(),
    active: z.boolean().default(true),
    /** Where submissions are stored by the edge backend. */
    submitTarget: z.enum(["custom_tour_requests", "custom_form_submissions", "cruise_requests", "contact_messages"]).default("custom_form_submissions"),
    legacy: z.object({ createdAt: z.string().optional(), updatedAt: z.string().optional() }).partial().optional(),
  })
  .strict();
export type CustomForm = z.infer<typeof CustomFormSchema>;

/* ─────────────────────────── Tour Ninja overrides & legacy tours ─────────────────────────── */

export const TourNinjaImageOverrideSchema = z
  .object({
    tourNinjaId: z.string(),
    tourName: z.string(),
    imageSourceType: z.enum(["upload", "direct_url", "url", "media"]).or(z.string()),
    customImageUrl: MediaRefSchema.nullable().optional(),
    directImageUrl: MediaRefSchema.nullable().optional(),
    originalImageUrl: MediaRefSchema.nullable().optional(),
    active: z.boolean().default(true),
    legacy: z.object({ id: z.number().int().optional(), createdAt: z.string().optional(), updatedAt: z.string().optional() }).partial().optional(),
  })
  .strict();
export type TourNinjaImageOverride = z.infer<typeof TourNinjaImageOverrideSchema>;

export const LegacyTourSchema = z
  .object({
    id: z.number().int(),
    title: z.string(),
    description: z.string(),
    shortDescription: z.string(),
    duration: z.string(),
    price: z.number(),
    childPrice: z.number().nullable().optional(),
    imageUrl: z.string(),
    tourNinjaUrl: z.string(),
    featured: z.boolean().nullable().optional(),
  })
  .strict();

export const LegacyContentBlockSchema = z
  .object({
    id: z.number().int(),
    identifier: z.string(),
    pageLocation: z.string(),
    title: z.string().nullable().optional(),
    subtitle: z.string().nullable().optional(),
    content: z.string().nullable().optional(),
    imageUrl: z.string().nullable().optional(),
    ctaText: z.string().nullable().optional(),
    ctaUrl: z.string().nullable().optional(),
    active: z.boolean().nullable().optional(),
    displayOrder: z.number().int().nullable().optional(),
  })
  .strict();

export const BlockTemplateSchema = z
  .object({
    id: z.number().int(),
    templateName: z.string(),
    blockType: z.string(),
    defaultConfiguration: z.record(z.any()).nullable().optional(),
    previewImage: z.string().nullable().optional(),
    description: z.string().nullable().optional(),
    active: z.boolean().nullable().optional(),
  })
  .strict();

/* ─────────────────────────── Media manifest ─────────────────────────── */

export const MediaItemSchema = z
  .object({
    /** Repo path, e.g. "/uploads/tours/tour-123.jpeg" or "/media/uploads/2026/09/photo.jpg". */
    path: z.string().startsWith("/"),
    filename: z.string(),
    originalName: z.string().optional(),
    mimeType: z.string().optional(),
    fileSize: z.number().int().optional(),
    sha256: z.string().optional(),
    altText: z.string().nullable().optional(),
    caption: z.string().nullable().optional(),
    folder: z.string().nullable().optional(),
    source: z.enum(["media_library", "uploads", "attached_assets", "mcp_upload", "public"]),
    createdAt: z.string().optional(),
  })
  .strict();
export const MediaManifestSchema = z
  .object({ generatedAt: z.string(), items: z.array(MediaItemSchema) })
  .strict();
export type MediaManifest = z.infer<typeof MediaManifestSchema>;

/* ─────────────────────────── Translations ─────────────────────────── */

/** Translation catalogs are nested string maps (legacy ui.<lang>.json layout, kept verbatim). */
export const TranslationCatalogSchema: z.ZodType<any> = z.lazy(() =>
  z.record(z.union([z.string(), z.number(), z.boolean(), z.null(), z.array(z.any()), TranslationCatalogSchema])),
);

/* ─────────────────────────── Helpers ─────────────────────────── */

export const CONTENT_FILES = {
  site: "site.json",
  theme: "theme.json",
  navigation: "navigation.json",
  footer: "footer.json",
  announcements: "announcements.json",
  redirects: "redirects.json",
  contentBlocks: "content-blocks.json",
  blockTemplates: "block-templates.json",
  pagesDir: "pages",
  destinationsDir: "destinations",
  staticPagesDir: "static-pages",
  blogPostsDir: "blog/posts",
  blogCategories: "blog/categories.json",
  blogTags: "blog/tags.json",
  formsDir: "forms",
  imageOverrides: "tour-ninja/image-overrides.json",
  legacyTours: "tour-ninja/legacy-tours.json",
  translationsDir: "translations",
} as const;

export function pagePathFromSlug(slug: string): string {
  return slug === "home" ? "/" : `/${slug}`;
}
