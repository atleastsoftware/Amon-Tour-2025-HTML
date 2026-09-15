import { z } from "zod";

/**
 * Public routes deliberately supported by the Amon Tour SPA. A release cannot
 * create routes, redirect a visitor, or alter the deployment domain.
 */
export const tourNinjaPublicRoutes = [
  "/", "/tours", "/experiences", "/tour-cards", "/stays", "/tour-ninja-iframe",
  "/custom-tour", "/booking", "/tour-view", "/payment-complete", "/external-stays",
  "/krabi-celebration", "/become-partner", "/group-corporate", "/brochure",
  "/villas-krabi", "/contact", "/blog", "/legal-notice", "/privacy-policy",
  "/terms-conditions", "/cruise",
] as const;

export const tourNinjaReleaseLocales = ["en", "fr", "es"] as const;

const supportedSectionTypes = [
  "hero_video", "hero_banner", "hero", "header_page", "text", "text_section",
  "text_image", "about_2col", "tour_grid", "cards_grid", "card_grid",
  "search_bar", "search_module", "search_bar_tours", "features_3col",
  "advantages", "testimonials", "contact", "contact_cards", "contact_info",
  "custom_form", "form", "cta_banner", "cta_section", "map_section", "gallery",
  "video_section", "video_hero", "text_gallery", "text_video", "newsletter",
  "social_media", "pdf_download", "interests", "popular_experiences",
  "custom_tour_form", "tour_ninja_section", "why_choose_us", "who_we_are",
  "expats_welcome", "blog_search", "text_listing", "text_pricing",
] as const;

const locale = z.enum(tourNinjaReleaseLocales);
const plainText = z.string().trim().min(1).max(3000).refine(
  (value) => !/[<>]/.test(value),
  "Release text must be plain text, not HTML",
);
const localizedText = z.object({
  en: plainText.optional(),
  fr: plainText.optional(),
  es: plainText.optional(),
}).strict().refine((value) => Object.values(value).some(Boolean), "At least one translation is required");

function isPrivateOrLocalHostname(hostname: string) {
  const normalized = hostname.toLowerCase().replace(/\.$/, "");
  if (normalized === "localhost" || normalized.endsWith(".local") || normalized.endsWith(".internal")) return true;
  if (
    normalized === "::1" || normalized === "[::1]" || normalized === "0.0.0.0" ||
    normalized.startsWith("[fc") || normalized.startsWith("[fd") ||
    normalized.startsWith("[fe80") || normalized.startsWith("[::ffff:")
  ) return true;
  const octets = normalized.split(".").map(Number);
  return octets.length === 4 && octets.every(Number.isInteger) && (
    octets[0] === 10 ||
    octets[0] === 127 ||
    octets[0] === 0 ||
    (octets[0] === 169 && octets[1] === 254) ||
    (octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31) ||
    (octets[0] === 192 && octets[1] === 168)
  );
}

/**
 * Durable release media must be a public, direct HTTPS asset. Query strings
 * are intentionally forbidden, which rejects signed/expiring asset URLs.
 */
export const durableMediaUrlSchema = z.string().url().max(2048).superRefine((value, ctx) => {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:") ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Media must use HTTPS" });
    if (url.username || url.password) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Media URL credentials are not allowed" });
    if (url.search) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Signed or query-string media URLs are not durable" });
    if (url.hash) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Fragment media URLs are not durable" });
    if (isPrivateOrLocalHostname(url.hostname)) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Local or private media hosts are not allowed" });
  } catch {
    // z.string().url() reports malformed URLs; keep this guard for runtime URL parsing.
  }
});

const route = z.enum(tourNinjaPublicRoutes);
const mediaId = z.string().regex(/^[a-z0-9][a-z0-9-_]{0,63}$/);
const hexColor = z.string().regex(/^#[0-9a-fA-F]{6}$/, "Colors must use #RRGGBB hexadecimal values");

const callToAction = z.object({
  label: localizedText,
  route,
}).strict();

const heroOverride = z.object({
  title: localizedText.optional(),
  highlight: localizedText.optional(),
  suffix: localizedText.optional(),
  description: localizedText.optional(),
  mediaId: mediaId.optional(),
  primaryCta: callToAction.optional(),
  secondaryCta: callToAction.optional(),
}).strict();

const seoOverride = z.object({
  title: localizedText.optional(),
  description: localizedText.optional(),
  keywords: localizedText.optional(),
  ogMediaId: mediaId.optional(),
}).strict();

const sectionOverride = z.object({
  id: z.string().regex(/^[a-z0-9][a-z0-9-_]{0,63}$/),
  type: z.enum(supportedSectionTypes),
  title: localizedText.optional(),
  subtitle: localizedText.optional(),
  description: localizedText.optional(),
  mediaId: mediaId.optional(),
  cta: callToAction.optional(),
}).strict();

export const tourNinjaReleaseSchema = z.object({
  schemaVersion: z.literal("tourninja-release/v1"),
  release: z.object({
    id: z.string().regex(/^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/),
    version: z.string().regex(/^[0-9]+(?:\.[0-9]+){0,2}$/),
    status: z.enum(["live", "draft"]),
    publishedAt: z.string().datetime({ offset: true }).optional(),
  }).strict(),
  branding: z.object({
    siteName: localizedText.optional(),
    logoMediaId: mediaId.optional(),
    colors: z.object({
      primary: hexColor.optional(),
      secondary: hexColor.optional(),
      accent: hexColor.optional(),
    }).strict().optional(),
  }).strict().optional(),
  languages: z.object({
    default: locale,
    supported: z.array(locale).min(1).max(3).refine((items) => new Set(items).size === items.length, "Languages must be unique"),
    labels: z.object({
      en: localizedText.optional(),
      fr: localizedText.optional(),
      es: localizedText.optional(),
    }).strict().optional(),
  }).strict().optional(),
  media: z.record(mediaId, z.object({
    kind: z.enum(["image", "video"]),
    url: durableMediaUrlSchema,
    alt: localizedText.optional(),
  }).strict()).default({}),
  navigation: z.object({
    items: z.array(z.object({
      id: z.string().regex(/^[a-z0-9][a-z0-9-_]{0,63}$/),
      label: localizedText,
      route,
    }).strict()).max(16).refine((items) => new Set(items.map((item) => item.id)).size === items.length, "Navigation ids must be unique"),
  }).strict().optional(),
  pages: z.array(z.object({
    route,
    hero: heroOverride.optional(),
    seo: seoOverride.optional(),
    sections: z.array(sectionOverride).max(32).refine(
      (items) => new Set(items.map((section) => section.id)).size === items.length,
      "Section ids must be unique within a page",
    ).optional(),
  }).strict()).max(tourNinjaPublicRoutes.length).refine(
    (items) => new Set(items.map((item) => item.route)).size === items.length,
    "Page routes must be unique",
  ).default([]),
  catalogue: z.object({
    heading: localizedText.optional(),
    description: localizedText.optional(),
    emptyMessage: localizedText.optional(),
    featuredTourIds: z.array(z.string().trim().min(1).max(128)).max(100)
      .refine((items) => new Set(items).size === items.length, "Tour ids must be unique").optional(),
  }).strict().optional(),
}).strict().superRefine((release, ctx) => {
  const media = release.media;
  const references: Array<[string | undefined, string]> = [
    [release.branding?.logoMediaId, "branding.logoMediaId"],
    ...release.pages.flatMap((page) => [
      [page.hero?.mediaId, `pages.${page.route}.hero.mediaId`] as [string | undefined, string],
      [page.seo?.ogMediaId, `pages.${page.route}.seo.ogMediaId`] as [string | undefined, string],
      ...(page.sections || []).map((section) => [section.mediaId, `pages.${page.route}.sections.${section.id}.mediaId`] as [string | undefined, string]),
    ]),
  ];
  for (const [id, path] of references) {
    if (id && !media[id]) ctx.addIssue({ code: z.ZodIssueCode.custom, path: path.split("."), message: `Unknown media id: ${id}` });
  }
  if (release.branding?.logoMediaId && media[release.branding.logoMediaId]?.kind !== "image") {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["branding", "logoMediaId"], message: "Brand logos must reference image media" });
  }
  if (
    release.languages &&
    !release.languages.supported.includes(release.languages.default)
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["languages", "default"],
      message: "The default language must be supported",
    });
  }
  for (const page of release.pages) {
    if (page.seo?.ogMediaId && media[page.seo.ogMediaId]?.kind !== "image") {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["pages", page.route, "seo", "ogMediaId"], message: "SEO social images must reference image media" });
    }
    for (const section of page.sections || []) {
      if (section.mediaId && media[section.mediaId]?.kind !== "image") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["pages", page.route, "sections", section.id, "mediaId"],
          message: "Section media must reference image media",
        });
      }
    }
  }
  if (release.release.status === "live" && !release.release.publishedAt) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["release", "publishedAt"], message: "Live releases require publishedAt" });
  }
});

export type TourNinjaRelease = z.infer<typeof tourNinjaReleaseSchema>;
export type TourNinjaReleaseLocale = z.infer<typeof locale>;
export type LocalizedText = z.infer<typeof localizedText>;
