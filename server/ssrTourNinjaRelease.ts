import { AsyncLocalStorage } from "node:async_hooks";
import type {
  LocalizedText,
  TourNinjaRelease,
  TourNinjaReleaseLocale,
} from "@shared/tourNinjaRelease";

/**
 * The small, serialisable portion of a page shell that a published release may
 * replace. It intentionally has no canonical, path, or JSON-LD fields: a
 * release is content, not routing or domain configuration.
 */
export type TourNinjaSsrPageOverride = {
  title?: string;
  description?: string;
  keywords?: string;
  metaImage?: string;
  h1?: string;
  heroDescription?: string;
  lang?: TourNinjaReleaseLocale;
};

type SsrPageBase = {
  path: string;
  title: string;
  description: string;
  h1: string;
  metaImage?: string;
  lang?: string;
};

const localeOrder: TourNinjaReleaseLocale[] = ["en", "fr", "es"];
const releaseContext = new AsyncLocalStorage<TourNinjaRelease | null>();

function localize(
  value: LocalizedText | undefined,
  preferred: TourNinjaReleaseLocale,
  defaultLocale: TourNinjaReleaseLocale,
): string | undefined {
  if (!value) return undefined;
  return value[preferred] || value[defaultLocale] || localeOrder.map((locale) => value[locale]).find(Boolean);
}

function asReleaseLocale(value: string | undefined): TourNinjaReleaseLocale | undefined {
  return localeOrder.find((locale) => locale === value);
}

/**
 * Pure resolver used by the SSR shell. Only a validated, published live
 * release can affect fields which are safe for release content to control.
 */
export function getTourNinjaSsrPageOverride(
  release: TourNinjaRelease | null | undefined,
  page: SsrPageBase,
): TourNinjaSsrPageOverride | undefined {
  if (!release || release.release.status !== "live") return undefined;

  const releasePage = release.pages.find((candidate) => candidate.route === page.path);
  if (!releasePage) return undefined;

  const defaultLocale = release.languages?.default ?? "en";
  const preferredLocale = asReleaseLocale(page.lang) ?? defaultLocale;
  const text = (value: LocalizedText | undefined) => localize(value, preferredLocale, defaultLocale);
  const heroTitle = [text(releasePage.hero?.title), text(releasePage.hero?.highlight), text(releasePage.hero?.suffix)]
    .filter((part): part is string => Boolean(part))
    .join(" ");
  const ogMediaId = releasePage.seo?.ogMediaId;
  const ogMedia = ogMediaId ? release.media[ogMediaId] : undefined;

  const contentOverride: TourNinjaSsrPageOverride = {
    title: text(releasePage.seo?.title),
    description: text(releasePage.seo?.description),
    keywords: text(releasePage.seo?.keywords),
    h1: heroTitle || undefined,
    heroDescription: text(releasePage.hero?.description),
    // The schema validates this reference as an image, but retain this check
    // so a caller cannot accidentally turn a social image into a video.
    metaImage: ogMedia?.kind === "image" ? ogMedia.url : undefined,
  };

  const definedContent = Object.fromEntries(
    Object.entries(contentOverride).filter(([, value]) => value !== undefined),
  ) as TourNinjaSsrPageOverride;
  return Object.keys(definedContent).length > 0
    ? { ...definedContent, lang: defaultLocale }
    : undefined;
}

/**
 * Scope a release to one SSR request. AsyncLocalStorage avoids mutable module
 * state, so concurrent requests cannot receive each other's release content.
 */
export function withTourNinjaSsrRelease<T>(
  release: TourNinjaRelease | null,
  operation: () => T,
): T {
  return releaseContext.run(release, operation);
}

export function getCurrentTourNinjaSsrRelease(): TourNinjaRelease | null | undefined {
  return releaseContext.getStore();
}