---
name: Static site + MCP CMS migration
description: Non-obvious constraints and decisions of the amon-tour.com migration to content/ + site/ + edge/ + mcp/
---
## Export source is not runtime configuration
Do not change the production request database based solely on the export source.
**Why:** Export snapshots and live transactional storage can represent different databases; their sizes or environment-variable names alone do not establish which one the published server uses.
**How to apply:** Preserve the runtime setting during cutover; verify database identity independently before any data migration.

## Preserve historical indexing
Keep added language-prefixed variants out of the index unless an SEO change is explicitly approved.
**Why:** The historical public site used one URL per page with client-side language switching; indexing new language URLs would change that contract.
**How to apply:** Treat language URL indexing as a separate migration decision, not an incidental generator change.

## No local-only production CMS writes
Do not enable editing backed only by the published filesystem.
**Why:** Replit deployment files are not durable across replacements; a successful local edit can disappear.
**How to apply:** Keep the CMS disabled until a durable content repository is connected; never treat local test commits as evidence of GitHub publishing.
