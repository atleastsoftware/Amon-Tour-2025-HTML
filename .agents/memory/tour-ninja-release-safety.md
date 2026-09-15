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