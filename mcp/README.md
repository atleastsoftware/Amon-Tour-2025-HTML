# CMS MCP Amon Tour

Ce serveur expose le contenu Git versionné d’Amon Tour aux clients MCP. Chaque écriture est validée avec le même schéma que le générateur statique, puis enregistrée sur `main` ou proposée par pull request. Aucun force-push n’est effectué.

## Démarrage

```bash
MCP_AUTH_TOKEN='un-jeton-long' GITHUB_REPO='atleastsoftware/Amon-Tour-2025-HTML' \
GITHUB_TOKEN='github_pat_...' npm run mcp:dev
```

Sans `GITHUB_TOKEN`, le serveur utilise le dépôt local (`process.cwd()`). `PORT` vaut `5100` par défaut.

Variables :

- `MCP_AUTH_TOKEN` (obligatoire) : protège toutes les requêtes MCP.
- `MCP_ALLOW_PATH_TOKEN=true` (optionnel, déconseillé) : autorise `/mcp/t/<jeton>` pour les clients incapables d'envoyer un en-tête Bearer. Le jeton peut alors apparaître dans les journaux d'URL.
- `GITHUB_TOKEN` : jeton runtime dédié, limité à `atleastsoftware/Amon-Tour-2025-HTML`, avec **Contents: read/write**, **Pull requests: read/write** et **Actions: read**.
- `GITHUB_REPO` : dépôt au format `owner/name`.
- `GITHUB_BRANCH` : branche de publication, `main` par défaut.
- `SITE_BASE_URL`, `EDGE_BASE_URL`, `TOUR_NINJA_PROXY_URL` : URLs publiques optionnelles.
- `MCP_LOCAL_GIT_COMMIT=1` : crée de vrais commits dans le mode local.

Vérification : `GET /mcp/health`. Transport : `POST/GET/DELETE /mcp` avec `Authorization: Bearer …`, ou `/mcp/t/<jeton>`.

## Connexion

**Claude** : *Settings > Connectors > Add custom connector*, puis saisir
`https://www.amon-tour.com/mcp` avec l’en-tête
`Authorization: Bearer <jeton>`. La variante `/mcp/t/<jeton>` exige
`MCP_ALLOW_PATH_TOKEN=true` et ne doit être activée qu'après acceptation du
risque de fuite du jeton dans les journaux d'URL.

**ChatGPT** : *Settings > Connectors > Developer mode > Add MCP server*. Saisir la
même URL et choisir *No authentication* lorsque le jeton est dans le chemin, ou
*Custom header* avec `Authorization` lorsqu’il est disponible.

## Outils

- Pages/sections : `list_pages`, `get_page`, `create_page`, `update_page`, `delete_page`, `list_sections`, `get_section`, `add_section`, `update_section`, `move_section`, `delete_section`, `list_section_types`. Exemple : « Ajoute un bloc texte à la fin de Tours. »
- SEO : `get_seo`, `update_seo`, `seo_audit`. Exemple : « Audite les titres SEO français. »
- Mise en page : `get/update_navigation`, `get/update_footer`, `get/update_theme`, `get/update_announcements`. Exemple : « Change la couleur primaire. »
- Blog : lecture, création, modification et suppression des articles, catégories et tags. Exemple : « Crée un brouillon sur Railay. »
- Pages statiques : `list_static_pages`, `get_static_page`, `create_static_page`, `update_static_page`.
- Médias : `list_media`, `upload_media`, `update_media_metadata`, `find_media_usages`. Limite d’envoi : 5 Mo.
- Traductions : `get_translations`, `update_translations`, `list_missing_translations`.
- Formulaires : `list_forms`, `get_form`, `update_form`.
- Tour Ninja : `list_tour_ninja_tours`, `get_tour_image_overrides`, `set_tour_image_override`.
- Redirections : `list_redirects`, `add_redirect`, `remove_redirect`.
- Publication : `validate_content`, `preview_page`, `publish_status`, `trigger_rebuild`, `get_commit_history`.

Pour les écritures, `commitMode: "pr"` crée une branche et une pull request ; le mode par défaut écrit sur `main`.

## Tests

```bash
npx tsx --test mcp/tests/*.test.ts
npx tsc --noEmit -p tsconfig.json
```