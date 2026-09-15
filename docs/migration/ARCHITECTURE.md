# Architecture cible — site HTML statique + CMS MCP piloté par GitHub

Dépôt : `atleastsoftware/Amon-Tour-2025` (branche `main`, historique conservé, jamais de force-push).

```
content/          Contenu versionné (JSON / Markdown) — validé par site/src/schema.ts (Zod)
media/            manifest.json + media/uploads/** (nouveaux médias envoyés via le MCP)
uploads/, attached_assets/   Médias historiques (déjà versionnés dans Git)
site/             Générateur statique : content/ → site/dist/ (HTML, sitemap.xml, robots.txt, _redirects.json)
edge/             Mini-backend Node/Express : sert site/dist + API Tour Ninja + formulaires + sync + monte le MCP
mcp/              Serveur MCP (Streamable HTTP) : CMS complet, chaque écriture = commit GitHub
scripts/migration Export PostgreSQL → content/ + archive JSON + inventaire
exports/archive   Données transactionnelles archivées (JSON, une table par fichier)
.github/workflows Validation du contenu + build + tests + déclenchement du déploiement
server/, client/  Ancienne application React/Express — conservée intacte comme rollback
```

## Flux de publication

1. Un client MCP (Claude, ChatGPT) appelle un outil d'écriture (`page_update_section`, `seo_update`, …).
2. Le serveur MCP charge `content/` depuis GitHub (API Git Data, sha de `main`), applique la modification en mémoire,
   **valide** l'arbre complet avec le schéma Zod, puis crée un commit (`main` ou branche + PR) via l'API GitHub.
   Message de commit explicite : `cms(<zone>): <description> [via MCP/<client>]`.
3. Le push sur `main` déclenche GitHub Actions (`content-ci.yml`) : validation + build + tests, puis appel du
   *deploy hook* (`DEPLOY_HOOK_URL`, secret GitHub) et/ou du webhook edge `POST /api/publish/rebuild`.
4. Le serveur edge (déploiement Replit Autoscale sur amon-tour.com) reçoit le webhook (signature HMAC `PUBLISH_WEBHOOK_SECRET`),
   resynchronise `content/` + `media/` depuis GitHub (`GITHUB_TOKEN`, `GITHUB_REPO`, `GITHUB_BRANCH`), régénère `site/dist`
   en mémoire/disque et sert la nouvelle version. Il resynchronise aussi périodiquement (`CONTENT_SYNC_INTERVAL_MIN`, défaut 10)
   et au démarrage. Sans token GitHub, il construit à partir du `content/` local (mode dégradé documenté).
5. L'outil MCP `publish_status` agrège : dernier commit `main`, état du dernier run GitHub Actions, version servie par edge (`GET /api/publish/status`).

## Interfaces internes

- `site/src/schema.ts` — schémas Zod, types, `CONTENT_FILES`.
- `site/src/content.ts` — `loadContent(FileSource)`, `fsSource`, `memorySource`, `overlaySource`, `validateContent`, `stringifyJson`, `stringifyMarkdown`.
- `site/src/build.ts` — `buildSite(content, { outDir })` → `BuildReport { routes[], files, sitemapUrls }` ; `renderRoute(content, path, lang)` → `{ html, status } | null` (utilisé par le MCP pour la prévisualisation) ; `listRoutes(content)`.
- `edge/src/app.ts` — `createEdgeApp({ distDir, mediaRoots, contentProvider, mcpRouter? })` ; `edge/src/server.ts` démarre sur `PORT` (5000 en dev).
- `mcp/src/server.ts` — `createMcpServer({ repo, siteBaseUrl, edgeBaseUrl })` ; `mcp/src/http.ts` — `createMcpRouter({ token })` (Express Router, transport Streamable HTTP, auth Bearer ou `/mcp/t/<token>`) ; `mcp/src/repo/github.ts` et `mcp/src/repo/local.ts` implémentent `ContentRepo`.

## Langues et URLs

Le site actuel utilise **une seule URL par page** avec bascule de langue côté client (`localStorage preferred-language`, `en` par défaut, `fr`/`es`). Le site statique reproduit ce comportement : le HTML canonique est généré en anglais à l'URL historique, et les variantes `fr`/`es` sont générées dans `/fr/<path>` et `/es/<path>` **avec `<link rel="canonical">` pointant vers l'URL historique et `noindex`**, afin de ne créer aucune nouvelle URL indexée (pas de régression SEO). Un petit script client applique la langue préférée (redirection interne vers `/fr/...` si l'utilisateur avait choisi le français) et met à jour les iframes Tour Ninja (`language` + `lang`).

Les balises hreflang, le sitemap (mêmes URL, mêmes priorités), `robots.txt`, JSON-LD (Organization, TravelAgency, TouristTrip, BreadcrumbList, FAQPage, BlogPosting) et les métadonnées OG/Twitter sont reproduits à l'identique depuis `server/ssrShared.ts` / `server/ssrSeoRoutes.ts`.

## Tour Ninja (strictement identique)

Routes portées dans `edge/` sans changement de contrat :
`GET /api/proxy/tours` (clé `tourninja-showcase-2-amontour`, companyId 2, fallback legacy, cache 24 h, `?fresh=true`, `?language=`),
`GET /api/tour-image-proxy/:tourId/:imageIndex` (header `x-api-key`), `GET /api/public/tour-showcase/:token`,
`GET /api/sync/tour-ninja`, `GET /api/sync/cruise-requests` (Bearer), `GET /api/public/tour-image-overrides`.
Les iframes `https://tourninja.io/details/<id>` et `/book/<id>` reçoivent `language` et `lang`.
Les surcharges d'images sont lues depuis `content/tour-ninja/image-overrides.json`.

## Données transactionnelles

Les formulaires publics écrivent toujours dans PostgreSQL (`DATABASE_URL`, mêmes tables, mêmes colonnes) pour que
`/api/sync/*` continue de servir Tour Ninja sans changement. Sans base (`DATABASE_URL` absent) le edge écrit dans
`edge/data/<table>.jsonl` et les routes de sync lisent ce fichier + l'archive `exports/archive/`. Un email est envoyé si `SENDGRID_API_KEY` (SendGrid, comme aujourd'hui) est configuré (comme aujourd'hui : optionnel).
