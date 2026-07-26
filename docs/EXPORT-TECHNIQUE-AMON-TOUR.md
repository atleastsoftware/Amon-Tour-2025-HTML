# Export technique — Amon Tour (amon-tour.com)

Document de référence pour recréer des sites vitrines connectés à Tour Ninja
(onboarding automatique). Dernière mise à jour : 26 juillet 2026.

---

## 1. Stack technique complète

### Frontend (SPA React)
| Élément | Technologie |
|---|---|
| Framework | React 18 + TypeScript |
| Build | Vite (dev + build), esbuild pour le serveur |
| Routing | wouter |
| État serveur / fetch | @tanstack/react-query v5 |
| Formulaires | react-hook-form + zod (@hookform/resolvers) |
| UI | Tailwind CSS + shadcn/ui (Radix UI primitives) |
| Animations | framer-motion |
| Icônes | lucide-react, react-icons |
| SEO côté client | react-helmet |
| Graphiques (admin) | recharts |
| Paiement | @stripe/react-stripe-js + @stripe/stripe-js |
| Upload | Uppy (@uppy/core, aws-s3, dashboard…) |
| i18n | @lingui/react + système de traduction automatique (Google Translate API) |

### Backend (Node.js)
| Élément | Technologie |
|---|---|
| Serveur | Express.js + TypeScript (exécuté via tsx en dev) |
| API | REST (routes dans `server/routes.ts`) |
| Sessions admin | express-session + connect-pg-simple (sessions en PostgreSQL) |
| Auth admin | Mot de passe (bcrypt) via `ADMIN_PASSWORD` |
| Rate limiting | express-rate-limit |
| Uploads fichiers | Multer + Object Storage Google Cloud (`@google-cloud/storage`) |
| Emails | SendGrid (`@sendgrid/mail`) |
| Paiement | Stripe (serveur : `server/stripe.ts`) |
| PDF | pdfkit |

### Base de données
| Élément | Technologie |
|---|---|
| SGBD | PostgreSQL (Neon serverless, `@neondatabase/serverless`) |
| ORM | Drizzle ORM + drizzle-zod (schéma dans `shared/schema.ts`) |
| Migrations | drizzle-kit (`npm run db:push`) |

### SSR / SEO (spécifique à ce site)
- `server/ssrShared.ts` + `server/ssrSeoRoutes.ts` : rendu HTML complet pour
  les robots (Googlebot, réseaux sociaux) sur `/`, `/tours`, `/tour-details/:id`,
  `/experiences`, `/custom-tour`, `/contact`, `/blog`. Les navigateurs réels
  reçoivent la SPA. Test forcé : `?_ssr=1`.
- `server/ssrDestinationRoutes.ts` : pages destinations SSR universelles
  (`/destinations` + 8 pages), sitemap.xml automatique, JSON-LD
  (TouristTrip, FAQPage), hreflang 11 langues.

### Scripts npm
```
dev   : NODE_ENV=development tsx server/index.ts   (Express + Vite sur le même port, 5000)
build : vite build && esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist
start : NODE_ENV=production node dist/index.js
check : tsc
db:push : drizzle-kit push
```

---

## 2. Connectivité Tour Ninja — TOUTES les routes

### Constantes
- Domaine externe : `https://www.tourninja.io`
- Clé API publique (vitrine) : `tourninja-showcase-2-amontour`
- `companyId` : `2`
- Clé de synchronisation entrante : `TOUR_NINJA_API_KEY_2025` (ou variable d'env `TOUR_NINJA_API_KEY`)

### 2.1 Récupération du catalogue de tours
**`GET /api/proxy/tours`** (proxy serveur, cœur du système)
- Appelle : `https://www.tourninja.io/api/public/tours?apiKey=tourninja-showcase-2-amontour&companyId=2&limit=100&language=<lang>`
- Fallback si échec : `https://www.tourninja.io/api/public/tours/legacy?companyId=2&language=<lang>`
- Cache serveur 24 h (`server/tourCache.ts`), forcer un rafraîchissement : `?fresh=true`
- Les données ne sont PAS stockées en base : fusion en mémoire avec les
  surcharges d'images locales (table `tour_ninja_image_overrides`).

**`GET /api/public/tour-showcase/:token`**
- Récupère un tour précis par ID/token via `https://www.tourninja.io/api/public/tours/legacy?companyId=2`

### 2.2 Images
**`GET /api/tour-image-proxy/:tourId/:imageIndex`**
- Proxy authentifié vers `https://www.tourninja.io/api/tours/images/<tourId>/<imageIndex>`
- Header requis : `x-api-key: tourninja-showcase-2-amontour`

**`GET /api/image-proxy/:tourId/presentation`**
- Sert les images mises en cache mémoire (base64) côté serveur.

**`/api/admin/tour-ninja-images`** (GET/POST/PUT/PATCH/DELETE, admin)
- CRUD des images personnalisées par tour (table `tour_ninja_image_overrides`,
  clé `tourNinjaId`). Stockage : Object Storage ou `/uploads` local.

### 2.3 Synchronisation entrante (Tour Ninja → site)
**`GET /api/sync/tour-ninja`**
- Tour Ninja vient chercher les demandes de tours sur mesure (`customTourRequests`).
- Header : `Authorization: Bearer <clé>` (`TOUR_NINJA_API_KEY_2025` ou env `TOUR_NINJA_API_KEY`).

**`GET /api/sync/cruise-requests`** — idem pour les demandes croisières.

**`GET /api/debug/tour-ninja`** — état de l'environnement + métadonnées du cache.

### 2.4 Affichage / réservation (frontend — NE PAS MODIFIER)
- Tout clic sur un tour passe par `openIframe()` (`client/src/contexts/IframeContext.tsx`)
  qui ouvre la page `/tour-ninja-iframe?url=...&title=...&type=...&return=...`
- URL de réservation : `https://www.tourninja.io/book/<tourId>`
- URL de présentation/détails : `https://www.tourninja.io/details/<tourId>`
- `openIframe` ajoute automatiquement `language`/`lang` selon la langue du site,
  et met `type=booking` si l'URL contient book/checkout/reserve.
- La page iframe ajoute des balises SEO cachées (JSON-LD TouristTrip, H1 sr-only).

---

## 3. Variables d'environnement nécessaires

| Variable | Rôle | Obligatoire |
|---|---|---|
| `DATABASE_URL` | PostgreSQL (Neon) | Oui |
| `SESSION_SECRET` | Sessions admin | Oui |
| `ADMIN_PASSWORD` | Connexion admin | Oui |
| `STRIPE_SECRET_KEY` | Paiement (serveur) | Si paiement |
| `VITE_STRIPE_PUBLIC_KEY` | Paiement (client) | Si paiement |
| `SENDGRID_API_KEY` | Emails | Si emails |
| `GOOGLE_TRANSLATE_API_KEY` | Traduction auto | Si traduction |
| `TOUR_NINJA_API_KEY` | Clé sync entrante (remplace la clé codée en dur) | Recommandé |
| `COMPANY_DOMAIN` | Domaine autorisé (vérifications) | Optionnel |
| `PORT` | Port serveur (défaut 5000) | Optionnel |
| `VITE_DISABLE_HERO_VIDEO` | Désactive la vidéo du hero | Optionnel |

---

## 4. Recette minimale pour un nouveau site vitrine Tour Ninja

Pour recréer un site vitrine, le strict nécessaire est :
1. Un serveur (Express ou autre) avec **un seul proxy** :
   `GET /api/proxy/tours` → `tourninja.io/api/public/tours?apiKey=<clé-vitrine>&companyId=<id>&limit=100&language=<lang>` (+ fallback `/legacy`, cache 24 h conseillé).
2. Le proxy d'images : `GET /api/tour-image-proxy/:tourId/:imageIndex` avec le
   header `x-api-key`.
3. L'affichage des tours en iframe : lien vers `tourninja.io/details/<id>`
   (présentation) et `tourninja.io/book/<id>` (réservation), avec les paramètres
   `language`/`lang`.
4. (Optionnel) L'endpoint de sync `GET /api/sync/...` protégé par Bearer token
   si le site collecte des demandes sur mesure à renvoyer vers Tour Ninja.

Chaque nouveau client = une clé vitrine (`tourninja-showcase-<companyId>-<nom>`)
et un `companyId`. Tout le reste (React, admin, blog, SSR) est propre à
amon-tour.com et n'est pas requis pour un simple site vitrine.

---

## 5. Autres briques fonctionnelles du site (pour mémoire)

- **Admin** : `/admin` — gestion tours, blog, demandes sur mesure, newsletter,
  messages contact, images Tour Ninja, pages dynamiques (blocs + WYSIWYG).
- **Formulaires publics** : demande de tour sur mesure, contact, newsletter
  (validation zod, emails SendGrid).
- **Stockage fichiers** : Object Storage Replit (Google Cloud Storage) +
  fallback `/uploads`.
- **Tracking** : balise Google Ads `AW-835155681` dans `index.html`
  (aucun événement de clic pour l'instant).
- **Sitemap** : `sitemap.xml` généré automatiquement (pages + destinations).
