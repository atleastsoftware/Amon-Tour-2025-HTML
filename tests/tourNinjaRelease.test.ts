import assert from "node:assert/strict";
import test from "node:test";
import { tourNinjaReleaseSchema } from "../shared/tourNinjaRelease";
import {
  clearTourNinjaReleaseSnapshotCache,
  getTourNinjaReleaseSnapshot,
} from "../server/services/tourNinjaReleaseService";
import {
  getTourNinjaSsrPageOverride,
  withTourNinjaSsrRelease,
} from "../server/ssrTourNinjaRelease";
import { ssrHtmlShell } from "../server/ssrShared";

const validRelease = {
  schemaVersion: "tourninja-release/v1",
  release: {
    id: "amon-live-2025-01",
    version: "1.0.0",
    status: "live",
    publishedAt: "2025-01-15T12:00:00.000Z",
  },
  branding: { siteName: { en: "Amon Tour" }, logoMediaId: "brand-logo" },
  languages: { default: "en", supported: ["en", "fr"], labels: { fr: { en: "French", fr: "Français" } } },
  media: {
    "brand-logo": {
      kind: "image",
      url: "https://cdn.example.com/amon/logo.png",
      alt: { en: "Amon Tour logo" },
    },
  },
  navigation: { items: [{ id: "tours", label: { en: "Tours" }, route: "/tours" }] },
  pages: [{
    route: "/",
    hero: {
      title: { en: "Discover Krabi" },
      mediaId: "brand-logo",
      primaryCta: { label: { en: "See tours" }, route: "/tours" },
    },
    seo: { title: { en: "Private tours in Krabi" }, ogMediaId: "brand-logo" },
    sections: [{ id: "ideas", type: "tour_ninja_section", title: { en: "Our ideas" } }],
  }],
  catalogue: { heading: { en: "Featured tours" }, featuredTourIds: ["tn-1"] },
};

test("accepts a strict live release using only supported content", () => {
  assert.deepEqual(tourNinjaReleaseSchema.parse(validRelease).release.version, "1.0.0");
});

test("rejects arbitrary routes and script-like extension fields", () => {
  const unknownRoute = structuredClone(validRelease);
  unknownRoute.pages[0].route = "/not-a-public-route";
  assert.equal(tourNinjaReleaseSchema.safeParse(unknownRoute).success, false);

  const arbitraryScript = structuredClone(validRelease);
  (arbitraryScript.pages[0].sections[0] as Record<string, unknown>).script = "alert(1)";
  assert.equal(tourNinjaReleaseSchema.safeParse(arbitraryScript).success, false);

  const htmlText = structuredClone(validRelease);
  htmlText.pages[0].hero.title.en = "<strong>Discover Krabi</strong>";
  assert.equal(tourNinjaReleaseSchema.safeParse(htmlText).success, false);
});

test("rejects signed/expiring media and unpublished live releases", () => {
  const signedMedia = structuredClone(validRelease);
  signedMedia.media["brand-logo"].url = "https://cdn.example.com/logo.png?X-Amz-Signature=secret";
  assert.equal(tourNinjaReleaseSchema.safeParse(signedMedia).success, false);

  const unpublished = structuredClone(validRelease);
  delete unpublished.release.publishedAt;
  assert.equal(tourNinjaReleaseSchema.safeParse(unpublished).success, false);
});

test("resolves only published live release SEO and hero fields for its exact route", () => {
  const release = tourNinjaReleaseSchema.parse({
    ...validRelease,
    pages: [{
      route: "/",
      hero: { title: { en: "Discover" }, highlight: { en: "Krabi" }, description: { en: "A private escape" } },
      seo: {
        title: { en: "Release title" },
        description: { en: "Release description" },
        keywords: { en: "krabi, private tours" },
        ogMediaId: "brand-logo",
      },
    }],
  });

  assert.deepEqual(getTourNinjaSsrPageOverride(release, {
    path: "/",
    title: "Fallback title",
    description: "Fallback description",
    h1: "Fallback H1",
  }), {
    title: "Release title",
    description: "Release description",
    keywords: "krabi, private tours",
    metaImage: "https://cdn.example.com/amon/logo.png",
    h1: "Discover Krabi",
    heroDescription: "A private escape",
    lang: "en",
  });
  assert.equal(getTourNinjaSsrPageOverride(release, {
    path: "/not-a-release-route",
    title: "Fallback title",
    description: "Fallback description",
    h1: "Fallback H1",
  }), undefined);

  const draft = structuredClone(release);
  draft.release.status = "draft";
  assert.equal(getTourNinjaSsrPageOverride(draft, {
    path: "/",
    title: "Fallback title",
    description: "Fallback description",
    h1: "Fallback H1",
  }), undefined);
});

test("SSR shell applies scoped live SEO without changing canonical or schema fallback", () => {
  const release = tourNinjaReleaseSchema.parse({
    ...validRelease,
    pages: [{
      route: "/",
      hero: { title: { en: "Discover Krabi" }, description: { en: "A private escape." } },
      seo: {
        title: { en: "Release title" },
        description: { en: "Release description" },
        keywords: { en: "krabi, private tours" },
        ogMediaId: "brand-logo",
      },
    }],
  });
  const options = {
    title: "Fallback title",
    description: "Fallback description",
    path: "/",
    h1: "Fallback H1",
    bodyHtml: "<p>Existing rich body</p>",
    schemaJsons: [{ "@context": "https://schema.org", "@type": "WebPage" }],
  };

  const fallbackHtml = ssrHtmlShell(options);
  assert.match(fallbackHtml, /<title>Fallback title<\/title>/);
  assert.doesNotMatch(fallbackHtml, /name="keywords"/);

  const liveHtml = withTourNinjaSsrRelease(release, () => ssrHtmlShell(options));
  assert.match(liveHtml, /<title>Release title<\/title>/);
  assert.match(liveHtml, /name="description" content="Release description"/);
  assert.match(liveHtml, /name="keywords" content="krabi, private tours"/);
  assert.match(liveHtml, /property="og:image" content="https:\/\/cdn\.example\.com\/amon\/logo\.png"/);
  assert.match(liveHtml, /<h1>Discover Krabi<\/h1>/);
  assert.match(liveHtml, /A private escape\.<\/p>/);
  assert.match(liveHtml, /rel="canonical" href="https:\/\/amon-tour\.com\/"/);
  assert.match(liveHtml, /"@type":"WebPage"/);
  assert.match(liveHtml, /Existing rich body/);
});

test("remote loader is disabled by default and refuses an unsafe configured endpoint", async () => {
  const originalEnabled = process.env.TOUR_NINJA_RELEASES_ENABLED;
  const originalUrl = process.env.TOUR_NINJA_RELEASES_URL;
  try {
    delete process.env.TOUR_NINJA_RELEASES_ENABLED;
    delete process.env.TOUR_NINJA_RELEASES_URL;
    clearTourNinjaReleaseSnapshotCache();
    assert.deepEqual(await getTourNinjaReleaseSnapshot("live"), {
      enabled: false,
      reason: "disabled",
      release: null,
    });

    process.env.TOUR_NINJA_RELEASES_ENABLED = "true";
    process.env.TOUR_NINJA_RELEASES_URL = "http://127.0.0.1/release.json";
    clearTourNinjaReleaseSnapshotCache();
    assert.deepEqual(await getTourNinjaReleaseSnapshot("live"), {
      enabled: false,
      reason: "unavailable",
      release: null,
    });
  } finally {
    if (originalEnabled === undefined) delete process.env.TOUR_NINJA_RELEASES_ENABLED;
    else process.env.TOUR_NINJA_RELEASES_ENABLED = originalEnabled;
    if (originalUrl === undefined) delete process.env.TOUR_NINJA_RELEASES_URL;
    else process.env.TOUR_NINJA_RELEASES_URL = originalUrl;
    clearTourNinjaReleaseSnapshotCache();
  }
});