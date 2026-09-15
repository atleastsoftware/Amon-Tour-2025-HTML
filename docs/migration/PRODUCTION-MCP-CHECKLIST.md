# Préparation production du CMS MCP

## Cible immuable

- Dépôt : `atleastsoftware/Amon-Tour-2025-HTML`
- Branche : `main`
- Site et MCP : `https://www.amon-tour.com` et `https://www.amon-tour.com/mcp`
- Serveur Replit autoscale : build `site:build` + `edge:build`, run `edge:start`, port 5000

Le serveur refuse de démarrer en production si le dépôt ou la branche diffère.
L'ancien dépôt `atleastsoftware/Amon-Tour-2025` n'est jamais utilisé.

## Secrets Replit requis avant publication

| Secret | État au 15 septembre 2026 | Usage / droits minimaux |
|---|---|---|
| `MCP_AUTH_TOKEN` | Manquant | Jeton aléatoire dédié (au moins 32 octets) présenté en `Authorization: Bearer`. |
| `GITHUB_TOKEN` | Manquant | Fine-grained PAT runtime limité au seul dépôt HTML : Contents RW, Pull requests RW, Actions Read, Metadata Read. |
| `TOUR_NINJA_SYNC_TOKEN` | Manquant, optionnel au lancement | Secret Bearer distinct pour les routes sync. Sans lui, seules ces routes répondent 503 ; site, catalogue et réservation continuent. |
| `DATABASE_URL` | Présent (géré par Replit) | Base historique qui conserve les demandes et abonnements. |
| `SENDGRID_API_KEY` | Manquant | Requis pour conserver les notifications email des formulaires qui en envoient. |

`GITHUB_PUSH_TOKEN` est un jeton humain temporaire de migration (expiration le
22 septembre 2026). Ne pas le renommer ni le réutiliser comme `GITHUB_TOKEN` :
le supprimer après la préparation Git. Le jeton runtime doit être distinct,
révocable indépendamment et ne doit pas avoir `Workflows: write`.

## Variables non secrètes requises

- `GITHUB_REPO=atleastsoftware/Amon-Tour-2025-HTML`
- `GITHUB_BRANCH=main`
- `SITE_BASE_URL=https://www.amon-tour.com`
- `CONTENT_SYNC_INTERVAL_MIN=10` (ou 1 à 10 selon le délai éditorial accepté)

Le producteur réel de `/api/sync/tour-ninja` et
`/api/sync/cruise-requests` est Tour Ninja, qui vient lire les demandes avec un
Bearer. Pour éviter une migration imposée, le runtime accepte d'abord
`TOUR_NINJA_SYNC_TOKEN`, puis l'ancienne variable `TOUR_NINJA_API_KEY` si elle
existe déjà. Ne modifier la configuration Tour Ninja qu'après avoir confirmé
le Bearer actuellement envoyé. Sans aucun des deux, les routes sync seules
répondent 503.

`EDGE_BASE_URL` n'est pas requis : le serveur utilise son URL locale
`http://127.0.0.1:5000` pour les appels internes. La clé vitrine images peut
être remplacée séparément avec `TOUR_NINJA_SHOWCASE_KEY`; la valeur vitrine
existante reste le fallback.

## Authentification et exposition

- Par défaut, le MCP accepte uniquement l'en-tête `Authorization: Bearer`.
- Ne définir `MCP_ALLOW_PATH_TOKEN=true` que si Claude/ChatGPT ne peut pas
  envoyer d'en-tête. Une URL contenant le jeton peut fuiter dans l'historique,
  les captures et les journaux proxy ; utiliser alors un jeton dédié et court,
  puis le faire tourner après la connexion.
- Les suppressions de page, section, article et redirection exigent désormais
  `confirm: true` au niveau de l'outil.
- Les modifications contenant `script`, `iframe`, `object`, `embed`, attributs
  `on*`, `javascript:` ou `srcdoc` sont refusées avant commit.

## GitHub Actions

Le workflow `content-ci` valide, construit et teste chaque commit sur `main`.
Le runtime MCP n'a pas besoin de `Actions: write` : `publish_status` lit les
runs, et `trigger_rebuild` appelle directement le serveur edge authentifié.

Les secrets GitHub `DEPLOY_HOOK_URL`, `EDGE_REBUILD_URL` et
`PUBLISH_WEBHOOK_SECRET` sont optionnels. Ne pas les créer pour la première
publication : le serveur edge relit `main` périodiquement et le MCP peut
déclencher son rebuild interne. Les ajouter uniquement si un webhook de
publication à chaud est décidé, avec une URL `www.amon-tour.com` et un secret
HMAC distinct.

## Contrôles avant publication

1. Enregistrer les secrets requis dans l'environnement Production sans afficher leurs valeurs.
2. Enregistrer les variables non secrètes ci-dessus.
3. Vérifier que le fine-grained PAT runtime appartient au compte opérateur,
   est limité au dépôt HTML et n'expire pas sans alerte/rotation planifiée.
4. Protéger `main` selon le mode choisi : commits MCP directs autorisés, ou
   imposer `commitMode: pr` si une revue humaine devient obligatoire.
5. Exécuter `content:validate`, `site:build`, `edge:build`,
   `test:migration` et le typecheck migration en local uniquement.
6. Ne pas exécuter de soumission réelle de formulaire, de suppression MCP ou
   d'écriture MCP contre la production pendant cette préparation.