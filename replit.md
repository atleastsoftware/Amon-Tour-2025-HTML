# Amon Tour - Thailand Travel Platform

## Overview
Amon Tour is a full-stack tour management system for a Thai travel agency specializing in Krabi and southern Thailand experiences. The platform includes a public-facing website for customers to browse and request custom tours, contact the agency, and an admin panel for comprehensive content and tour management. The project aims to provide a seamless booking and management experience, integrating external tour providers while offering a rich, localized user interface.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### UI/UX Decisions
The frontend is built with **React 18** and **TypeScript**, using **Tailwind CSS** for styling with a custom design system featuring blue (#1e73be) and gold (#E6B64C) theme colors. **Shadcn/ui** components ensure consistency, while **Framer Motion** provides animations. SEO is managed with **React Helmet**.

### Technical Implementations
- **Frontend**: Utilizes **Vite** for fast builds, **Wouter** for routing, **React Query** for server state, and **React Hook Form** with **Zod** for form validation.
- **Backend**: An **Express.js** server with **TypeScript** provides a **RESTful API**. It features middleware for authentication, validation, error handling, **Multer** for file uploads, session management for admin, and rate limiting.
- **Database**: **PostgreSQL** is used with **Drizzle ORM** for type-safe operations, hosted on **Neon Database** (serverless). **Drizzle Kit** handles migrations.

### Feature Specifications
- **Public Website**: Tour browsing (including **Tour Ninja** integration), custom tour requests, contact system, blog, newsletter signup, and SEO optimization.
- **Admin Dashboard**: Tour card builder, blog management, custom tour request processing, newsletter management, and contact message handling.
- **Core Features**: Dynamic content rendering for blocks, WYSIWYG editor for pages, dynamic legal page content, and an automatic browser translation system.

### System Design Choices
- **Modular Block System**: Content is managed through reusable blocks with a defined creation procedure, ensuring consistency and maintainability.
- **API Proxy**: Handles external **Tour Ninja** integration for expanded tour inventory and image management.
- **Comprehensive Error Handling**: Implemented across the platform, especially for form submissions and external API calls.
- **SEO via Dynamic Rendering (SSR)**: Because the site is a React SPA, Googlebot would otherwise see only an empty `<div id="root">`. To fix this, `server/ssrShared.ts` and `server/ssrSeoRoutes.ts` intercept requests from search-engine and social bots (User-Agent based) and return fully-rendered HTML for `/`, `/tours`, `/tour-details/:id`, `/experiences`, `/custom-tour`, `/contact`, `/blog`. Real browsers fall through to the SPA unchanged. Each SSR page includes title, meta description, H1, real DB content, canonical, 11 hreflang locales and JSON-LD structured data (TravelAgency, TouristTrip, BreadcrumbList, ContactPage). Force SSR for testing via `?_ssr=1`.
- **Programmatic Destination Pages**: `server/ssrDestinationRoutes.ts` adds keyword-targeted SSR landing pages (`/destinations` hub + 8 individual pages: `/destinations/agence-francophone-krabi`, `/destinations/koh-phi-phi`, `/destinations/phang-nga-bay`, `/destinations/thalane-bivouac`, `/destinations/catamaran-krabi`, `/destinations/railay-beach`, plus two family-targeted pages — `/destinations/sejour-famille-personnalise-thailande` (FR) and `/destinations/family-tailor-made-trip-thailand` (EN) — for families seeking personalized stays away from mass tourism). Each page has 400+ words of real content, a GEO direct-answer intro, TouristTrip + FAQPage JSON-LD, WhatsApp CTAs, and internal links. The renderer is **language-aware** (`UiLang`/`UI` chrome map keyed off each destination's `lang`), so the English page renders genuinely English UI strings while existing FR pages stay French. New pages auto-wire into `sitemap.xml` (via `DESTINATION_SLUGS`) and the `/destinations` hub (via the `DESTINATIONS` array). Sitemap priorities are 0.8–0.9 (the two family pages and the top destinations at 0.9). All routes are universal SSR (no bot-gating) since these pages have no SPA counterpart.

## External Dependencies

- **@neondatabase/serverless**: PostgreSQL database connectivity.
- **drizzle-orm**: Type-safe database operations.
- **@tanstack/react-query**: Server state management and caching.
- **wouter**: Lightweight client-side routing.
- **zod**: Schema validation.
- **bcrypt**: Password hashing.
- **@radix-ui/**: Accessible UI component primitives.
- **tailwindcss**: Utility-first CSS framework.
- **framer-motion**: Animation library.
- **lucide-react**: Icon library.
- **Tour Ninja API**: External API for tour inventory and details, accessed via a custom server-side proxy.
- **Stripe**: (Prepared for) Payment processing integration.
- **SendGrid**: For email notifications and confirmations.
## Migration vers site HTML statique + CMS MCP (2026-09-15)

Nouvelle architecture en parallèle de l'application React/Express (conservée intacte comme rollback) :
- `content/` : contenu versionné (pages, sections, SEO, navigation, blog, pages légales, traductions, surcharges d'images Tour Ninja), validé par `site/src/schema.ts` (Zod). Exporté depuis PostgreSQL par `npm run content:export` (lecture seule sur `NEON_DATABASE_URL`).
- `site/` : générateur statique (`npm run site:build -- --out site/dist`), parité SEO vérifiée avec `scripts/migration/seo-snapshot.ts` contre `exports/seo-baseline/`.
- `edge/` : mini-backend Express (`npm run edge:dev`, port 5000) : site statique + API Tour Ninja identique + formulaires + sync + MCP monté sur `/mcp` (`MCP_AUTH_TOKEN` requis).
- `mcp/` : serveur MCP Streamable HTTP (57 outils CMS) ; chaque écriture = commit GitHub (`GITHUB_TOKEN`/`GITHUB_REPO`) ou écriture locale + rebuild en dev.
- Docs : `docs/migration/{MIGRATION,ARCHITECTURE,INVENTAIRE,SEO-COMPARAISON,VALIDATION-MCP}.md`, `mcp/README.md`, `edge/tests/parity.md`.
- Pack client (Claude/ChatGPT) : `docs/PACK-CLIENT-MCP.md` + `docs/PACK-CLIENT-MCP-AIDE-MEMOIRE.md` ; script de vérification des prompts : `MCP_BASE=… MCP_TOKEN=… node scripts/migration/mcp-pack-check.mjs` (à rejouer en production après la bascule ; laisse une catégorie/un tag de blog, un média et une surcharge d'image de test). Le MCP en production (`https://amon-tour.com/mcp`, `www.` répond aussi) ne répond qu'après republication + secrets `MCP_AUTH_TOKEN`, `GITHUB_TOKEN`, `GITHUB_REPO`.
- La prochaine publication Replit utilise le serveur edge (`NODE_ENV=production`) ; l'aperçu utilise `npm run edge:dev`. La publication effective nécessite « Republier ». Procédure et rollback dans `docs/migration/MIGRATION.md` §4–6.
- Décision du propriétaire : publier avant de connecter GitHub ; il effectuera les tests manuels. Le CMS reste désactivé sans ses secrets. Conserver `DATABASE_URL` du serveur historique pour les demandes, sans migration automatique de schéma.
- Typecheck des nouveaux modules : `npx tsc --noEmit -p tsconfig.migration.json` ; tests : `npm run test:migration`.
