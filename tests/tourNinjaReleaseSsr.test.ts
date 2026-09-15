import assert from "node:assert/strict";
import test from "node:test";
import { tourNinjaReleaseSchema } from "../shared/tourNinjaRelease";
import { ssrHtmlShell } from "../server/ssrShared";
import { withTourNinjaSsrRelease } from "../server/ssrTourNinjaRelease";

const fallbackOptions = {
  title: "Fallback title",
  description: "Fallback description",
  path: "/",
  h1: "Fallback H1",
  bodyHtml: `<section class="section"><h2>Existing rich section</h2><p>Existing rich body.</p></section>`,
  schemaJsons: [{
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Fallback schema",
  }],
};

function seoMarkup(html: string) {
  const start = html.indexOf("<title>");
  const end = html.indexOf('    <link rel="icon"');
  assert.notEqual(start, -1);
  assert.notEqual(end, -1);
  return html.slice(start, end);
}

function heroMarkup(html: string) {
  const start = html.indexOf('    <section class="page-hero">');
  const end = html.indexOf('    <section class="page-content">');
  assert.notEqual(start, -1);
  assert.notEqual(end, -1);
  return html.slice(start, end);
}

function schemaMarkup(html: string) {
  return [...html.matchAll(/<script type="application\/ld\+json">.*?<\/script>/g)]
    .map((match) => match[0])
    .join("\n");
}

function liveRelease() {
  return tourNinjaReleaseSchema.parse({
    schemaVersion: "tourninja-release/v1",
    release: {
      id: "amon-live-2025-01",
      version: "1.0.0",
      status: "live",
      publishedAt: "2025-01-15T12:00:00.000Z",
    },
    languages: { default: "en", supported: ["en"] },
    media: {
      social: {
        kind: "image",
        url: "https://cdn.example.com/amon/social-image.png",
        alt: { en: "Amon Tour at sea" },
      },
    },
    pages: [{
      route: "/",
      hero: {
        title: { en: "Discover Krabi" },
        highlight: { en: "your way" },
        description: { en: "A private escape with local guides." },
      },
      seo: {
        title: { en: "Live release title" },
        description: { en: "Live release description" },
        keywords: { en: "krabi, private tours" },
        ogMediaId: "social",
      },
    }],
  });
}

test("SSR fallback markup is byte-for-byte unchanged for disabled, invalid, draft, and nonmatching release contexts", () => {
  const fallback = ssrHtmlShell(fallbackOptions);

  // The route wrappers scope null for disabled, unavailable, and invalid
  // loader snapshots. This is deliberately a full-document comparison.
  assert.equal(withTourNinjaSsrRelease(null, () => ssrHtmlShell(fallbackOptions)), fallback);

  const draft = liveRelease();
  draft.release.status = "draft";
  assert.equal(withTourNinjaSsrRelease(draft, () => ssrHtmlShell(fallbackOptions)), fallback);

  const nonMatchingRelease = liveRelease();
  nonMatchingRelease.pages[0].route = "/tours";
  assert.equal(withTourNinjaSsrRelease(nonMatchingRelease, () => ssrHtmlShell(fallbackOptions)), fallback);

  assert.equal(seoMarkup(fallback), `<title>Fallback title</title>
    <meta name="description" content="Fallback description" />
    <link rel="canonical" href="https://amon-tour.com/" />
    <link rel="alternate" hreflang="en" href="https://amon-tour.com/" />
    <link rel="alternate" hreflang="en-MY" href="https://amon-tour.com/" />
    <link rel="alternate" hreflang="en-SG" href="https://amon-tour.com/" />
    <link rel="alternate" hreflang="en-AU" href="https://amon-tour.com/" />
    <link rel="alternate" hreflang="fr" href="https://amon-tour.com/" />
    <link rel="alternate" hreflang="th" href="https://amon-tour.com/" />
    <link rel="alternate" hreflang="zh-CN" href="https://amon-tour.com/" />
    <link rel="alternate" hreflang="zh-SG" href="https://amon-tour.com/" />
    <link rel="alternate" hreflang="zh-MY" href="https://amon-tour.com/" />
    <link rel="alternate" hreflang="ms" href="https://amon-tour.com/" />
    <link rel="alternate" hreflang="x-default" href="https://amon-tour.com/" />

    <meta property="og:type" content="website" />
    <meta property="og:title" content="Fallback title" />
    <meta property="og:description" content="Fallback description" />
    <meta property="og:url" content="https://amon-tour.com/" />
    <meta property="og:image" content="https://amon-tour.com/amon-tour-team.jpg" />
    <meta property="og:site_name" content="Amon Tour" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="Fallback title" />
    <meta name="twitter:description" content="Fallback description" />
    <meta name="twitter:image" content="https://amon-tour.com/amon-tour-team.jpg" />

`);
  assert.equal(heroMarkup(fallback), `    <section class="page-hero">
        <div class="container">
            
            <h1>Fallback H1</h1>
            <p>Fallback description.</p>
        </div>
    </section>
`);
});

test("live release SEO overrides preserve canonical, schema, and existing SSR body markup", () => {
  const fallback = ssrHtmlShell(fallbackOptions);
  const live = withTourNinjaSsrRelease(liveRelease(), () => ssrHtmlShell(fallbackOptions));

  assert.equal(seoMarkup(live), `<title>Live release title</title>
    <meta name="description" content="Live release description" />
    <meta name="keywords" content="krabi, private tours" />
    <link rel="canonical" href="https://amon-tour.com/" />
    <link rel="alternate" hreflang="en" href="https://amon-tour.com/" />
    <link rel="alternate" hreflang="en-MY" href="https://amon-tour.com/" />
    <link rel="alternate" hreflang="en-SG" href="https://amon-tour.com/" />
    <link rel="alternate" hreflang="en-AU" href="https://amon-tour.com/" />
    <link rel="alternate" hreflang="fr" href="https://amon-tour.com/" />
    <link rel="alternate" hreflang="th" href="https://amon-tour.com/" />
    <link rel="alternate" hreflang="zh-CN" href="https://amon-tour.com/" />
    <link rel="alternate" hreflang="zh-SG" href="https://amon-tour.com/" />
    <link rel="alternate" hreflang="zh-MY" href="https://amon-tour.com/" />
    <link rel="alternate" hreflang="ms" href="https://amon-tour.com/" />
    <link rel="alternate" hreflang="x-default" href="https://amon-tour.com/" />

    <meta property="og:type" content="website" />
    <meta property="og:title" content="Live release title" />
    <meta property="og:description" content="Live release description" />
    <meta property="og:url" content="https://amon-tour.com/" />
    <meta property="og:image" content="https://cdn.example.com/amon/social-image.png" />
    <meta property="og:site_name" content="Amon Tour" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="Live release title" />
    <meta name="twitter:description" content="Live release description" />
    <meta name="twitter:image" content="https://cdn.example.com/amon/social-image.png" />

`);
  assert.equal(heroMarkup(live), `    <section class="page-hero">
        <div class="container">
            
            <h1>Discover Krabi your way</h1>
            <p>A private escape with local guides.</p>
        </div>
    </section>
`);
  assert.equal(schemaMarkup(live), schemaMarkup(fallback));
  assert.match(live, /<section class="section"><h2>Existing rich section<\/h2><p>Existing rich body\.<\/p><\/section>/);
});