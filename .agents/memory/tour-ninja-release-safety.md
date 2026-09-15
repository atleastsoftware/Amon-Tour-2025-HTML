---
name: Tour Ninja release safety
description: Safety decisions for the pilot site's remote content integration.
---

Keep Tour Ninja presentation integration opt-in and additive. Do not enable,
deploy, replace local CMS data, or change domains just to demonstrate remote
content. Treat the release document as a proposed upstream contract until
Tour Ninja confirms its endpoint and semantics.

**Why:** The operator explicitly requires preservation of the existing site
and no automatic publication; the available repository did not establish the
Netlify site/backend mapping or a Tour Ninja editorial-release API.

**How to apply:** Preserve the current CMS/static/catalogue fallback. Keep
MCP authoring and approval upstream. Pin an approved content digest for live
activation; process-local revision caches are not durable publication controls.
Use permanent media storage: rejecting signed URL syntax alone cannot promise
the provider will retain the resource.

Do not make a new Tour Ninja synchronization secret a prerequisite for site
startup or silently change the credentials used by the external producer.

**Why:** The operator controls Tour Ninja and explicitly requires the site,
catalogue, image proxy, and booking links to survive cutover without an
out-of-scope Tour Ninja migration.

**How to apply:** Isolate synchronization authentication to its two read
routes. If no compatible token exists, return a clear service-unavailable
response only there. Confirm the producer's current Bearer before changing it.