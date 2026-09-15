# Rapport de validation « pilotage MCP » — Claude et ChatGPT

Objectif : prouver que le site est pilotable de bout en bout via le MCP depuis Claude et ChatGPT
(modifier une page + son SEO → commit GitHub → site publié mis à jour).

## A. Validation automatisée (réalisée dans l'environnement de développement)

Les tests `npm run test:migration` exécutent, contre une copie du vrai `content/` :

| Scénario | Outil MCP | Vérification | Résultat |
|---|---|---|---|
| Modifier le titre SEO de `/tours` | `update_seo` | `content/pages/tours.json` → `seo.en.title` modifié, arbre valide, commit créé | voir §C |
| Ajouter une section sur `/tours` (`/experiences` partage la même page) | `add_section` | section ajoutée en fin de page, rendu HTML contient le texte | voir §C |
| Refuser une modification invalide | `add_section` (type inconnu) | erreur Zod, aucun fichier écrit, aucun commit | voir §C |
| Handshake client MCP (Streamable HTTP) | `initialize`, `tools/list` | liste des outils ; 401 avec mauvais token | voir §C |
| Prévisualisation avant commit | `preview_page` | HTML rendu + plan H1/H2 | voir §C |
| Publication | `publish_status`, `trigger_rebuild` | sha `main`, état CI, version servie par edge | voir §C |

## B. Validation manuelle depuis Claude et ChatGPT (à dérouler après déploiement)

Prérequis : edge + MCP déployés (`docs/migration/MIGRATION.md` §4), `MCP_AUTH_TOKEN` défini, `GITHUB_TOKEN` avec droits `contents:write`, `pull_requests:write`, `actions:read` sur `atleastsoftware/Amon-Tour-2025`.

URL du connecteur : `https://amon-tour.com/mcp/t/<MCP_AUTH_TOKEN>` (ou `https://amon-tour.com/mcp` + en-tête `Authorization: Bearer <token>`).
Vérification rapide : `curl -s https://amon-tour.com/mcp/health` → `{"ok":true}`.

### B1. Claude (connecteur personnalisé)
1. Claude → Paramètres → Connecteurs → « Ajouter un connecteur personnalisé » → coller l'URL → Ajouter.
2. Nouvelle conversation, activer le connecteur « Amon Tour CMS ».
3. Prompt : « Liste les pages du site, puis change le titre SEO anglais de la page /tours en “Private Tours in Krabi — Amon Tour (2026)” et committe sur main. »
4. Attendu : appels `list_pages` → `update_seo` ; réponse contenant l'URL du commit GitHub.
5. Prompt : « Quel est l'état de publication ? » → `publish_status` : run `content-ci` en cours puis `success`, `edge.sha` = nouveau commit.
6. Vérifier : `curl -s https://amon-tour.com/tours | grep -o '<title>[^<]*'` → nouveau titre. Capturer l'écran de la conversation + le commit GitHub.

### B2. ChatGPT (mode développeur / connecteurs)
1. ChatGPT → Paramètres → Connecteurs → Avancé → activer « Mode développeur » → « Créer » → Nom « Amon Tour CMS », URL du serveur MCP, Authentification « Aucune » (le token est dans l'URL) → Créer.
2. Nouvelle conversation → Outils → activer le connecteur.
3. Prompt : « Ajoute sur la page /experiences une section texte intitulée “Nouveautés 2026” avec deux phrases de présentation en anglais et sa traduction française, prévisualise-la puis committe. »
4. Attendu : `get_page` → `preview_page` → `add_section` ; commit GitHub ; `publish_status` vert.
5. Vérifier : `curl -s https://amon-tour.com/experiences | grep -c "Nouveautés 2026"` → 1 ; `https://amon-tour.com/fr/experiences` contient la version française.

### B3. Scénarios complémentaires (un par zone)
- Navigation : « Renomme l'entrée de menu “Cruise” en “Cruises” » → `update_navigation`.
- Média : « Téléverse cette image et utilise-la comme image de couverture de l'article X » → `upload_media` + `update_blog_post`.
- Blog : « Crée un brouillon d'article “Kayak à Ao Thalane” » → `create_blog_post` (status draft, non publié, absent du sitemap).
- Traductions : « Quelles sections de la page d'accueil n'ont pas de traduction espagnole ? » → `list_missing_translations`.
- Rollback éditorial : « Annule la dernière modification de /tours » → `get_commit_history` + `update_seo` (nouveau commit, jamais de force-push).

## C. Journal des exécutions

> À compléter avec les captures/journaux lors de la validation réelle (les tests automatisés de la section A sont exécutés par `npm run test:migration` ; leur sortie est reproduite ci-dessous à chaque exécution).

### C1. Scénario automatisé de bout en bout (2026-09-15, environnement de développement)

Serveur edge + MCP démarrés localement (`MCP_AUTH_TOKEN=test-token PORT=5000 npx tsx edge/src/server.ts`, dépôt local),
client MCP officiel (`@modelcontextprotocol/sdk` Streamable HTTP, script `scripts/migration/mcp-e2e.mjs`) simulant la
séquence « Claude modifie le titre SEO de /tours » puis « ChatGPT ajoute une section sur /experiences » :

1. `tools/list` → 57 outils.
2. `update_seo(tours, en, title)` → commit → reconstruction → `curl /tours` : `<title>Private Tours in Krabi — Amon Tour (2026 e2e)</title>` ✅
3. `add_section(tours, text, i18n.fr)` → `/tours` et `/experiences` contiennent la section, `/fr/tours` contient la version française ✅
4. `add_section` avec un type inconnu → rejet par validation, aucun fichier écrit ✅
5. `preview_page(tours, fr)` → HTML contenant la section française ✅ ; `publish_status` → sha + dernier commit ✅ ; `list_tour_ninja_tours` → catalogue réel via le proxy ✅
6. Routes de contrôle : `/booking` → 301 `/tours`, `/nope` → 404, `/sitemap.xml` 200, `/api/sync/tour-ninja` 401 sans Bearer / 200 avec ✅

Extrait du journal :

```
tools: 57 list_pages, get_page, create_page, update_page, delete_page, list_sections, get_section, add_section, update_section, move_section, delete_section, list_section_types, get_seo, update_seo, seo_audit, get_navigation, update_navigation, get_footer, update_footer, get_theme, update_theme, get_announcements, update_announcements, list_blog_posts, get_blog_post, create_blog_post, update_blog_post, delete_blog_post, list_blog_categories, create_blog_categorie, list_blog_tags, create_blog_tag, list_static_pages, get_static_page, update_static_page, create_static_page, list_media, upload_media, update_media_metadata, find_media_usages, get_translations, update_translations, list_missing_translations, list_forms, get_form, update_form, list_tour_ninja_tours, get_tour_image_overrides, set_tour_image_override, list_redirects, add_redirect, remove_redirect, validate_content, preview_page, publish_status, trigger_rebuild, get_commit_history
[
  {
    "slug": "become-partner",
    "path": "/become-partner",
    "name": "Become Partner",
    "type": "secondary",
    "active": true,
    "customCode": true,
    "seo": {
      "en": {}
    },
    "sitemap": {
      "include": true,
      "changefreq": "monthly",
      "priority": 0.4
    },
{
  "en": {
    "title": "Private Tours in Krabi — Amon Tour (2026 e2e)"
  }
}
update_seo -> {
  "commit": {
    "sha": "local-1789445180248",
    "url": "file:///home/runner/workspace",
    "branch": "local"
  },
  "summary": "SEO en de tours mis à jour"
}
add_section -> {
  "commit": {
    "sha": "local-1789445180531",
    "url": "file:///home/runner/workspace",
    "branch": "local"
  },
  "summary": "section text_1789445180496 ajoutée à tours"
}
ERR add_section MCP error -32602: Input validation error: Invalid arguments for tool add_section: Invalid enum value. Expected 'header_page' | 'hero' | 'hero_banner' | 'hero_video' | 'text' | 'text_section' | 'text_image' | 'about_2col' | 'cta_banner' | 'cta_section' | 'contact_info' | 'contact_cards' | 'contact' | 'form' | 'custom_form' | 'dynamic_form' | 'custom_tour_form' | 'advantages' | 'card_grid' | 'cards_
invalid -> MCP error -32602: Input validation error: Invalid arguments for tool add_section: Invalid enum value. Expected 'header_page' | 'hero' | 'hero_banner' | 'hero_video' | 'text' | 'text_section' | 'text_i
preview contains fr title: true
{
  "repository": {
    "headSha": "c419c607bd9a005ea9511184c9f9820130a4f361",
    "lastCommit": {
      "message": "Pre-migration snapshot: Tour Ninja release overlay work (uncommitted before HTML/MCP migration)",
      "date": "2026-09-15T03:35:26Z",
      "url": "file:///home/runner/workspace"
[
  {
    "id": "VNbDPiuZIN",
    "name": "Private half Day Trip to Ao Nang's local islands with sunset and plankton",
    "price": 0,
    "duration": 1,
    "category": "",
    "detailsUrl": "https:/

```

Tests unitaires/intégration (2026-09-15, dernière exécution) : `npm run test:migration` → **20 réussis, 0 échec**, sortie normale en environ 3 secondes. Inclut les sept formulaires générés et le vrai bundle de production avec commit Git dans une copie temporaire, reconstruction et HTML servi modifié. Typecheck migration et les deux builds réussis.

Régressions supplémentaires couvertes : rejet des origines privées/trompeuses et des redirections dans le proxy images (HTTPS et hôtes Tour Ninja exacts uniquement), extraction du jeton vitrine en anglais/français/espagnol avec exécution du JavaScript généré, absence de références directes `secrets.*` dans les conditions du workflow GitHub.

Stockage PostgreSQL : les champs JSON `interests`, `tripTypes` et `destinations` sont sérialisés explicitement avant l'appel Pool. Un test intercepte les paramètres SQL du vrai chemin `EdgeStorage.insert` pour vérifier tableaux vides et non vides ; aucun enregistrement de test n'a été écrit dans la base clients.

Iframe : test du JavaScript généré refusant les URL `javascript:`, `data:`, HTTP, hôtes trompeurs, identifiants et ports personnalisés. Les liens HTTPS détails/réservation Tour Ninja conservent `language` et `lang`. Les retours vers des sites externes sont refusés. Le refus d'une URL `javascript:` a également été vérifié dans l'aperçu navigateur.

La fin du test de production a été corrigée : le processus Node est désormais arrêté et attendu directement, sans enfant npm orphelin. Les tests ne contactent pas la base clients.

Le propriétaire prend en charge les tests manuels et demande de connecter GitHub après la publication. Ceci ne constitue pas une validation réelle depuis Claude/ChatGPT ni une preuve de commit GitHub ; les lignes correspondantes ci-dessous restent à compléter.

| Date | Client | Scénario | Commit | Résultat |
|---|---|---|---|---|
| | Claude | B1 | | |
| | ChatGPT | B2 | | |
