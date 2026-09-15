# Migration amon-tour.com — site HTML statique + CMS MCP piloté par GitHub

Date de l'export : 2026-09-15. État pré-migration : tag Git `pre-migration-2026-09-15` (commit `c419c607`).

Documents liés :
- `INVENTAIRE.md` — comptages table par table (base → export → contenu généré), régénéré par `npm run content:export`.
- `ARCHITECTURE.md` — cible technique (content/, site/, edge/, mcp/, pipeline).
- `VALIDATION-MCP.md` — procédure et rapport de validation « pilotage MCP » (Claude + ChatGPT).
- `../../mcp/README.md` — connexion du MCP à Claude / ChatGPT, liste des outils.
- `../../edge/tests/parity.md` — parité route par route de l'API Tour Ninja / formulaires.

## 1. Ce qui a été fait

| Étape | Résultat |
|---|---|
| Sécuriser l'existant | Travail non commité intégré dans `main` (commit `c419c607`), tag `pre-migration-2026-09-15`. Le déploiement Replit actuel (React/Express) est **inchangé** et sert de rollback. Le push GitHub doit être fait depuis le panneau Git de Replit (aucun identifiant de push n'est disponible dans l'environnement d'exécution de la tâche). |
| Export intégral | `scripts/migration/export-content.ts` (lecture seule sur `NEON_DATABASE_URL`) → `content/`, `media/manifest.json`, `exports/archive/2026-09-15/*.json` (toutes les tables, 1 fichier par table ; mots de passe `users` caviardés), `docs/migration/INVENTAIRE.md`. |
| Modèle de contenu | `site/src/schema.ts` (Zod) + `site/src/content.ts` (chargement/validation partagés par l'export, le générateur, le edge et le MCP). |
| Générateur statique | `site/` — `npm run site:build` → `site/dist` (toutes les routes publiques, 3 langues, sitemap, robots, JSON-LD, redirections). |
| Mini-backend edge | `edge/` — `npm run edge:dev` (port 5000) : site statique + API Tour Ninja identique + formulaires + sync + `/mcp`. |
| Serveur MCP | `mcp/` — Streamable HTTP, auth par token, chaque écriture = commit GitHub (jamais de force-push). |
| Pipeline | `.github/workflows/content-ci.yml` : validation → build → tests → deploy hook / rebuild edge. |

## 2. Correspondance des URL (ancien → nouveau)

Toutes les URL publiques indexées sont **conservées à l'identique**. Les seules redirections 301 concernent des routes techniques du flux de paiement Stripe retiré (hors périmètre, cf. tâche) et un alias.

| Ancienne URL | Nouvelle URL | Statut |
|---|---|---|
| `/`, `/tours`, `/experiences`, `/custom-tour`, `/contact`, `/cruise`, `/blog`, `/blog/:slug` | identiques | 200 |
| `/destinations`, `/destinations/:slug` (8 pages) | identiques | 200 |
| `/krabi-celebration`, `/become-partner`, `/group-corporate`, `/brochure`, `/villas-krabi`, `/stays`, `/external-stays` | identiques | 200 |
| `/privacy-policy`, `/terms-conditions`, `/legal-notice`, `/about` | identiques | 200 |
| `/tour-ninja-iframe?url=&title=&return=` | identique | 200 |
| `/tour-detail/:id` (3 tours legacy) | identique | 200 |
| `/tour/:token` (vitrine) | identique (page hydratée par `/api/public/tour-showcase/:token`) | 200 |
| `/sitemap.xml`, `/robots.txt` | identiques (même liste d'URL, priorités, hreflang) | 200 |
| `/fr/...`, `/es/...` | **nouvelles** variantes de langue, `noindex` + `canonical` vers l'URL anglaise (aucune nouvelle URL indexée) | 200 |
| `/tour-details/:id` | `/tour-detail/:id` | 301 |
| `/booking`, `/cart`, `/payment-complete` | `/tours` (réservation via Tour Ninja) | 301 |
| `/admin`, `/api/admin/*`, `/login` | supprimés — le back-office est remplacé par le MCP | 404 |

Les redirections sont éditables via le MCP (`list_redirects`, `add_redirect`) dans `content/redirects.json`.

### API (contrat inchangé)

`GET /api/proxy/tours` (`?fresh=true`, `?language=`), `GET /api/tour-image-proxy/:tourId/:imageIndex`, `GET /api/public/tour-showcase/:token`, `GET /api/sync/tour-ninja`, `GET /api/sync/cruise-requests` (Bearer), `GET /api/public/tour-image-overrides`, formulaires `POST /api/custom-tour`, `/api/custom-tour-requests`, `/api/contact-messages`, `/api/krabi-celebration`, `/api/partnership-requests`, `/api/cruise-requests`, `/api/group-requests`, `/api/newsletter/subscribe|confirm|unsubscribe`. Détail : `edge/tests/parity.md`.

## 3. Où sont les données

| Donnée | Avant | Après |
|---|---|---|
| Pages + sections | `page_configurations`, `page_blocks` | `content/pages/<slug>.json` (sections avec `props`, `i18n.fr/es`, `legacy.blockId`) |
| SEO par page/langue | colonnes `seo_*` (toutes vides) + valeurs par défaut du SSR | `content/pages/<slug>.json` → `seo.{en,fr,es}` ; défauts SSR conservés dans le générateur |
| Navigation, footer, thème, annonces | `navigation_menu_items`, `site_settings` | `content/navigation.json`, `footer.json`, `theme.json` (+ `legacySettings` verbatim), `announcements.json` |
| Pages légales / statiques | `static_pages` | `content/static-pages/<slug>.md` |
| Blog | `blog_posts`, `blog_categories`, `blog_tags`, `blog_post_tags` | `content/blog/posts/<slug>.md`, `categories.json`, `tags.json` |
| Formulaires personnalisés | `custom_forms` | `content/forms/<id>.json` |
| Surcharges d'images Tour Ninja | `tour_ninja_image_overrides` | `content/tour-ninja/image-overrides.json` |
| Pages destinations (SEO programmatique) | code (`server/ssrDestinationRoutes.ts`) | `content/destinations/<slug>.json` (désormais éditables via MCP) |
| Traductions | `client/src/locales/{en,fr,es}.json` | `content/translations/ui.<lang>.json` (verbatim) + `i18n` par section |
| Médiathèque / fichiers | `media_library` (vide), `uploads/`, `attached_assets/` | inchangés dans Git + `media/manifest.json` ; nouveaux médias MCP dans `media/uploads/AAAA/MM/` |
| Demandes (sur mesure, croisière, groupe, partenariat, célébration), newsletter, contact, réservations, soumissions | PostgreSQL | **toujours PostgreSQL** (edge écrit dans les mêmes tables) + archive `exports/archive/2026-09-15/` |
| Historique de blocs, templates, content_blocks, tours legacy | tables | `exports/archive/` + `content/block-templates.json`, `content/content-blocks.json`, `content/tour-ninja/legacy-tours.json` |

## 4. Déploiement du nouveau site (bascule)

### Périmètre accepté pour cette publication

Le propriétaire demande de publier maintenant et de traiter le reste via GitHub ensuite.
Le CMS n'est pas présenté comme complet : les templates custom ignorent encore une partie des
modifications de contenu/SEO ; les sources légales doivent être unifiées ; l'édition MCP des
destinations et la configuration sitemap des nouvelles pages restent à finaliser.
Ne pas activer le MCP avant correction et tests de ces chemins (certains commits sont sans effet
sur le rendu). Les tests réels Claude/ChatGPT et la configuration email restent également ultérieurs.
La restriction des URL iframe à HTTPS sur les hôtes Tour Ninja exacts est appliquée avant publication.

Le domaine ne change pas. La bascule consiste à faire servir amon-tour.com par le serveur edge au lieu de l'ancienne application Express.

### Option A (recommandée) — même déploiement Replit, nouvelle commande

1. Selon la demande du propriétaire du 2026-09-15 : publier le site d'abord, créer/connecter GitHub après ; les tests manuels seront effectués par le propriétaire. Aucun push GitHub à cette étape.
2. `.replit` est configuré pour la prochaine publication :
   - Build : `npm run site:build -- --out site/dist && npm run edge:build`
   - Run : `NODE_ENV=production npm run edge:start`
3. Conserver le secret de production `DATABASE_URL` de l'ancien serveur. `NEON_DATABASE_URL` a servi à l'export du contenu mais ne remplace pas automatiquement la base des demandes. En production, l'absence de `DATABASE_URL` arrête désormais le serveur plutôt que d'enregistrer des demandes dans des fichiers éphémères. Aucune migration de schéma automatique.
4. Cliquer **Republier** dans Replit, puis dérouler la check-list §5. La modification de `.replit` seule ne met pas à jour le site public. Pour revenir à l'ancien serveur : Build `npm run build`, Run `npm run start`, puis republier.
5. Configuration vérifiée avant publication : `MCP_AUTH_TOKEN`, `GITHUB_TOKEN` et `SENDGRID_API_KEY` absents. Le CMS reste désactivé et les notifications email ne sont pas envoyées ; les demandes sont enregistrées en base. Le proxy Tour Ninja conserve sa clé vitrine de secours historique.
6. Après publication seulement : connecter GitHub et configurer `GITHUB_TOKEN`, `GITHUB_REPO`, `GITHUB_BRANCH`, `MCP_AUTH_TOKEN`, `PUBLISH_WEBHOOK_SECRET`, ainsi que le workflow de publication. Ne pas activer le CMS avec un dépôt local éphémère en production.

### Option B — nouvel hébergement puis bascule DNS

Déployer edge (Node 20) sur la cible choisie, tester sur son URL temporaire (check-list §5 avec `Host` forcé), puis modifier l'enregistrement DNS `amon-tour.com` / `www`. L'ancien déploiement Replit reste en ligne jusqu'à validation ; rollback = remettre l'ancien enregistrement DNS (TTL recommandé : 300 s pendant la bascule).

## 5. Check-list de vérification avant/après bascule

- [ ] `curl -s https://amon-tour.com/sitemap.xml | diff - exports/seo-baseline/sitemap.xml` : même liste d'URL.
- [ ] Pour chaque URL du sitemap : `title`, `meta description`, `canonical`, `hreflang`, JSON-LD identiques (script `npm run test:migration` + `exports/seo-baseline/`).
- [ ] `GET /api/proxy/tours` renvoie le catalogue (même `success/tours/count`) ; `?fresh=true` contourne le cache.
- [ ] `GET /api/tour-image-proxy/<id>/0` renvoie une image.
- [ ] `/tour-ninja-iframe?url=https://tourninja.io/details/<id>` charge l'iframe avec `language`+`lang`.
- [ ] `GET /api/sync/tour-ninja` : 401 sans Bearer, 200 avec le token Tour Ninja, même JSON.
- [ ] Un envoi de chaque formulaire public crée une ligne en base (visible via `/api/sync/*`).
- [ ] Depuis Claude puis ChatGPT : `update_seo` → commit → `publish_status` → nouvelle balise visible sur le site (cf. `VALIDATION-MCP.md`).

## 6. Rollback

- Avant bascule : rien à faire, l'ancien site est en production.
- Après bascule (option A) : remettre Build `npm run build` / Run `npm run start` et redéployer (≈ 2 min). Le contenu CMS de l'ancien back-office est toujours en base (aucune table supprimée, l'export est en lecture seule).
- Après bascule (option B) : rétablir le DNS.
- Le tag `pre-migration-2026-09-15` permet de revenir au code exact d'avant migration (`git checkout pre-migration-2026-09-15`) sans réécrire l'historique.

## 7. Limites connues / points d'attention

- Les 14 images de surcharge `/uploads/tours/tour-17609292…` étaient déjà absentes de la production (voir `INVENTAIRE.md`).
- Les commits MCP portent l'identité du `GITHUB_TOKEN` ; utiliser un token de machine dédié (« amon-tour-cms ») pour un historique lisible.
- Les variantes `/fr/` et `/es/` sont `noindex` : le comportement SEO reste celui d'aujourd'hui (une seule URL indexée par page, en anglais).
