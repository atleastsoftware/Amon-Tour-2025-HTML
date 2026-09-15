# Tour Ninja versioned remote releases (proposed contract)

This is an **additive, read-only integration** for Amon Tour presentation
configuration. It is not a known Tour Ninja API and does not claim that any
Tour Ninja endpoint currently implements it. A release host and its upstream
approval/commit process must be provided by the operator before activation.

When disabled, unreachable, malformed, wrong-stage, or invalid, Amon Tour
uses exactly its existing local branding, translations, page content, Tour
Ninja catalogue proxy, and iframe flows. The integration never writes the CMS
database, deletes content, deploys, redirects users, or changes the domain.

## Activation

Do **not** set these values unless a controlled release host is ready:

```env
TOUR_NINJA_RELEASES_ENABLED=true
TOUR_NINJA_RELEASES_URL=https://releases.example.com/amon/live.json
TOUR_NINJA_RELEASES_TOKEN=optional-server-only-bearer-token
TOUR_NINJA_DRAFT_RELEASE_URL=https://releases.example.com/amon/draft.json
TOUR_NINJA_RELEASES_CACHE_SECONDS=60
```

For a production pilot, pin the approved live revision using
`TOUR_NINJA_LIVE_RELEASE_ID`, `TOUR_NINJA_LIVE_RELEASE_VERSION` and
`TOUR_NINJA_LIVE_RELEASE_CONTENT_DIGEST` (the `sha256-…` digest returned by the
read endpoint). Equivalent `TOUR_NINJA_DRAFT_RELEASE_*` pins are available.
Pins are checked before serving content. Pinning the digest prevents a changed
upstream document from being accepted after a server restart. Process-local
revision tracking alone is not a persistent release registry.

Restrict assets to operator-owned, public, permanent storage using
`TOUR_NINJA_TRUSTED_MEDIA_HOSTS` (comma-separated hosts) or
`TOUR_NINJA_TRUSTED_MEDIA_ORIGINS` (comma-separated HTTPS origins). Do not use
temporary preview/download endpoints, even if they contain no query string:
URL syntax checks cannot prove an external provider's retention policy.
Keep versioned assets available for the lifetime of releases referencing them.

Optional bounded controls: `TOUR_NINJA_RELEASES_TIMEOUT_SECONDS` (default 8,
1–30) and `TOUR_NINJA_RELEASES_FAILURE_CACHE_SECONDS` (default 15, 1–300).

Exact rules:

- `TOUR_NINJA_RELEASES_ENABLED` must equal `true`; any other value disables
  the feature.
- The live and draft endpoints are separate, server-configured HTTPS URLs.
  No browser request parameter can select a URL. Local/private hosts,
  credentials in URLs, and redirects are rejected.
- `TOUR_NINJA_RELEASES_TOKEN`, if set, is sent as `Authorization: Bearer …`
  server-to-server only. It is never serialized to the browser.
- Cache seconds are bounded to 10–3600 (60 by default). A snapshot is parsed
  in full before it is served; invalid/upstream-failed responses are not used.
- Durable remote media must be direct public HTTPS URLs without a query
  string. This deliberately rejects signed, tokenized, and expiring URLs.

## Proposed `tourninja-release/v1` document

The configured endpoint must return this JSON document itself (not an envelope):

```json
{
  "schemaVersion": "tourninja-release/v1",
  "release": {
    "id": "amon-live-2025-01",
    "version": "1.0.0",
    "status": "live",
    "publishedAt": "2025-01-15T12:00:00.000Z"
  },
  "branding": {
    "siteName": { "en": "Amon Tour", "fr": "Amon Tour", "es": "Amon Tour" },
    "logoMediaId": "brand-logo",
    "colors": { "primary": "#084F6E", "secondary": "#E6B64C", "accent": "#42ABB2" }
  },
  "languages": {
    "default": "en",
    "supported": ["en", "fr", "es"],
    "labels": { "fr": { "en": "French", "fr": "Français" } }
  },
  "media": {
    "brand-logo": {
      "kind": "image",
      "url": "https://cdn.example.com/amon/logo.png",
      "alt": { "en": "Amon Tour logo" }
    }
  },
  "navigation": {
    "items": [
      { "id": "tours", "label": { "en": "Tours" }, "route": "/tours" }
    ]
  },
  "pages": [
    {
      "route": "/",
      "hero": {
        "title": { "en": "Discover Krabi" },
        "highlight": { "en": "your way" },
        "description": { "en": "Private local experiences." },
        "mediaId": "brand-logo",
        "primaryCta": { "label": { "en": "See tours" }, "route": "/tours" }
      },
      "seo": {
        "title": { "en": "Private Krabi tours" },
        "description": { "en": "Discover Krabi with local specialists." },
        "keywords": { "en": "Krabi tours, Thailand" },
        "ogMediaId": "brand-logo"
      },
      "sections": [
        { "id": "ideas", "type": "tour_ninja_section", "title": { "en": "Tour ideas" } }
      ]
    }
  ],
  "catalogue": {
    "heading": { "en": "Featured tours" },
    "description": { "en": "Available experiences" },
    "emptyMessage": { "en": "No tours are available right now." },
    "featuredTourIds": ["tour-ninja-external-id"]
  }
}
```

The shared Zod schema is `shared/tourNinjaRelease.ts`; it is strict at every
object boundary. It accepts only the existing `en`, `fr`, and `es` UI
languages, known public SPA routes, localized plain strings, direct durable
media references, CTA routes, and the already supported page-section type
names. It rejects unknown keys, HTML/CSS/JavaScript fields, unknown media IDs,
duplicate routes/IDs, non-HTTPS or signed media, and routes outside the
allowlist. `live` requires `publishedAt`; the draft endpoint must return
`release.status: "draft"`.

`pages[].sections` is intentionally a constrained compatibility vocabulary,
not a page-builder import. Match `sections[].id` to an existing block's
`identifier` and its existing type. It cannot create/delete/reorder local blocks,
introduce a route or replace forms with executable remote code. The overlay
consumes compatible block text/image/CTA fields, existing heroes, branding
name/logo/colors, language visibility/labels, header navigation, route SEO,
and catalogue heading/selection. Templates and unprovided fields remain local.
This does not import arbitrary nested builder configuration or all CMS fields.
Existing public routes outside the allowlist retain their original behavior.

Catalogue products, prices and detail/booking URLs still come from the existing
`GET /api/proxy/tours?language=…` adapter, not from duplicated release records.
The upstream catalogue is `/api/public/tours`, with its existing legacy fallback.
Images continue through `/api/tour-image-proxy/:tourId/:imageIndex` where used.
The existing local image customizations and iframe integration are not removed.

This is a runtime content overlay, not an offline export. The local fallback
includes the existing CMS database and existing catalogue service dependencies;
it does not manufacture missing local CMS rows. Export/backup those separately
when moving hosting.

## Public and preview endpoints

- `GET /api/tour-ninja/releases/live` is the only public configuration
  endpoint. It returns `{ enabled: false, reason, release: null }` when the
  integration cannot safely supply a valid live snapshot.
- `GET /api/admin/tour-ninja/releases/preview` requires the existing Amon Tour
  admin session. It fetches only the configured draft endpoint and sends
  `Cache-Control: no-store, private` and `X-Robots-Tag: noindex`.

There are no public preview URLs, arbitrary preview tokens, query-string
release selectors, or remote URLs accepted from a user. An authenticated admin
uses **Preview Tour Ninja draft** in the existing admin dashboard. The browser
uses tab-scoped session storage to select the private preview endpoint and pin
its returned `contentDigest`. Subsequent requests send
`X-Tour-Ninja-Preview-Digest`; a changed draft returns 409 rather than silently
replacing the reviewed version. Exit or logout clears the preview. Authorization
is checked again on focus/visibility restoration and every 60 seconds; a failed
check removes the draft from the UI.

Preview responses are private/no-store/noindex, including authentication errors.
Preview pages also emit noindex metadata. SSR only ever loads live/local
content, never drafts. Existing server-only pages do not become draft-rendered
pages through this SPA preview; the supported preview surface is the existing
SPA route allowlist.

On existing SSR shells, valid live page SEO and compatible hero heading/summary
are applied without replacing canonical URLs, JSON-LD or rich fallback body.
With no matching valid release, the HTML output is preserved. Arbitrary
server-only destination/blog paths are not made editable by this contract.

## Release workflow

1. Create a document at the controlled upstream release host with
   `status: "draft"` and validate it with `tourNinjaReleaseSchema.safeParse`.
   `npm run test:tourninja-release` runs the implementation regression suite;
   it does not validate a remotely hosted document.
2. An authenticated Amon Tour admin previews that configured draft. Review
   the snapshot/version and clear the tab preview after review.
3. **Commit/publish upstream**: the upstream owner creates a distinct
   `status: "live"` document with `publishedAt` at
   `TOUR_NINJA_RELEASES_URL`.
4. If production is pinned, the operator explicitly updates the approved live
   pins after review. The server reads the accepted snapshot on the bounded
   refresh interval, and browsers revalidate on focus/periodically. If unpinned,
   a valid upstream live revision can become visible without a code deployment.
   Amon Tour performs no upstream write, commit or deployment action itself.

No Netlify deployment configuration is added: the exact Netlify site/backend
mapping is not known from this repository. This feature requires the existing
Express backend (including the new read endpoints); publishing only the static
Vite directory is insufficient. No production domain has been changed.

For safe rollback, disable the feature to restore the original local
presentation, or explicitly restore an approved upstream release and matching
pins. No reverse database migration is needed because this layer writes no CMS
data. The MCP Draft/Commit operations belong to Tour Ninja; this repository
implements their read/preview consumer, not a second MCP authoring server.

The existing `/api/proxy/tours` source and all detail/booking/presentation
iframe handling stay authoritative for actual catalogue data and booking.
`featuredTourIds` can only select already-proxied Tour Ninja IDs; it cannot
inject tours, URLs, scripts, or iframe destinations.