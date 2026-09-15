# Parité des routes edge

| Route historique | Paramètres / auth | Contrat edge |
|---|---|---|
| `GET /api/proxy/tours` | `language`, `fresh=true` | Même enveloppe, cache mémoire 24 h et repli legacy |
| `GET /api/tour-image-proxy/:tourId/:imageIndex` | Clé Tour Ninja en amont | Image, cache 1 h, redirection placeholder |
| `GET /api/public/tour-showcase/:token` | Public | Objet Tour Ninja ou erreurs 404/500 |
| `GET /api/proxy/image` | `url` Tour Ninja uniquement | Binaire, CORS `*`, cache 1 h |
| `GET /api/sync/tour-ninja` | Bearer dédié ou variable d'environnement; `status`, `since` | `{success,count,data,lastSync,filters}` |
| `GET /api/sync/cruise-requests` | Même auth; `status`, `since` | Même enveloppe avec `type` |
| Formulaires publics | JSON, validation Zod | Statuts 201/400 et messages historiques |
| Newsletter | `subscribe`, `confirm`, `unsubscribe` | Messages et statuts historiques |
| `GET /api/public/custom-forms/:id` | Public | Formulaire exporté, couleurs compatibles aplaties |
| Réglages/navigation/blocs | Public | Données dérivées du contenu Git |
| Blog | Public, filtres catégorie/tag | Publications issues des fichiers Markdown |
| `GET /api/publish/status` | Public | `{sha,source,syncedAt,builtAt,routes,ok}` |
| `POST /api/publish/rebuild` | HMAC GitHub ou Bearer MCP | Synchronisation, reconstruction, statut |
| Fichiers statiques / redirections / 404 | Public | Extensions HTML, médias, motifs `:param`, page 404 |