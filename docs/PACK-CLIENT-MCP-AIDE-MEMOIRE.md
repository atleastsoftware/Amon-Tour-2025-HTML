# Amon Tour CMS — aide-mémoire (1 page)

Guide complet : `docs/PACK-CLIENT-MCP.md`. Jeton d'accès remis séparément — ne jamais le coller dans un document ou un prompt partagé.


## Liens
- Site : https://amon-tour.com
- Connecteur MCP : `https://amon-tour.com/mcp` (test : `/mcp/health` → `{"ok":true}`) — actif après la bascule du nouveau site
- Historique du contenu : https://github.com/atleastsoftware/Amon-Tour-2025/commits/main/content
- Publications : https://github.com/atleastsoftware/Amon-Tour-2025/actions/workflows/content-ci.yml

## Prompts les plus utiles

| Besoin | Prompt |
|---|---|
| Voir le site | `Liste toutes les pages avec leur URL et leur nombre de sections.` |
| Modifier un texte | `Sur la page home, remplace "[ancien]" par "[nouveau]" en français.` |
| Ajouter une section | `Sur la page tours, ajoute à la fin une section texte "Titre" avec [texte] en FR, EN et ES.` |
| Aperçu avant publication | `Prévisualise la page home avec le plan des titres avant de committer.` |
| SEO d'une page | `Pour la page tours en français : titre "[...]", description "[...]".` |
| Audit SEO | `Audite le SEO de toutes les pages et propose des corrections sans rien modifier.` |
| Menu | `Renomme l'entrée de menu "Cruise" en "Croisières" (FR) et "Cruises" (EN).` |
| Pied de page | `Mets à jour le WhatsApp du pied de page : [+66 ...].` |
| Annonce | `Affiche une barre d'annonce "[texte]" avec un lien vers /tours.` |
| Blog | `Crée un brouillon d'article "[titre]" de 600 mots en français, avec titre SEO et méta-description. Ne le publie pas.` |
| Publier un article | `Publie l'article [slug].` |
| Image | `Téléverse cette image sous le nom [nom].jpg avec l'alt "[texte]" et utilise-la pour [page/article].` |
| Traductions | `Quels textes de la page home manquent en espagnol ? Traduis-les et enregistre après mon accord.` |
| Tours mis en avant | `Liste les tours Tour Ninja disponibles.` / `Remplace l'image du tour [id] sur notre site par /media/[fichier].jpg.` |
| Redirection | `Ajoute une redirection permanente de /ancienne-url vers /nouvelle-url.` |
| État | `Quel est l'état de publication ? Le site correspond-il au dernier commit ?` |
| Annuler | `Remets le titre SEO français de la page tours à "[ancienne valeur]".` (ou Revert sur GitHub) |
| Sans risque | `Propose cette modification en pull request au lieu de la publier : [demande].` |

Guide complet : `docs/PACK-CLIENT-MCP.md`.

## Garde-fous
- Pas de suppression en masse : une suppression = une demande = un commit. Toujours demander confirmation.
- Le CMS ne voit ni ne modifie les clés Tour Ninja, les tours, les prix, les réservations, le code du site.
- Jamais de force-push ; tout contenu invalide est refusé avant commit (le site reste intact).


## Brancher (une fois)
- **Claude** : Settings → Connectors → Add custom connector → nom `Amon Tour CMS`, URL `https://amon-tour.com/mcp`, en-tête `Authorization: Bearer <jeton>` (sinon URL `https://amon-tour.com/mcp/t/<jeton>`).
- **ChatGPT** : Settings → Connectors → Advanced → Developer mode → Add MCP server → même URL, auth *Custom header* `Authorization: Bearer <jeton>` (sinon *No authentication* + URL `/mcp/t/<jeton>`).
- Test : « Liste toutes les pages du site avec leur URL et leur nombre de sections. »


## Prompts prêts à copier
| Besoin | Prompt |
|---|---|
| Inventaire | Liste toutes les pages, puis la structure (sections, identifiants) de la page d'accueil. |
| Nouvelle page | Crée une page secondaire « … » à l'adresse /… avec un hero « … » et un texte d'intro, SEO anglais title « … » / description « … », inactive pour l'instant. |
| Texte | Dans la section <id> de la page <slug>, remplace le titre par « … » sans toucher au reste. |
| Ajouter un bloc | Sur la page <slug>, ajoute après la section <id> une bannière d'appel à l'action « … » avec le bouton « … » vers <url>. |
| SEO | Mets à jour le SEO anglais de la page <slug> : title (≤ 60 car.) « … », description (140–160 car.) « … », image OG /media/…, canonical https://amon-tour.com/<slug>, indexable. |
| Audit SEO | Fais un audit SEO de toutes les pages (longueurs, champs manquants, par langue) et propose les corrections prioritaires. |
| Plan SEO multilingue | Pour les pages <…>, propose title + description en en/fr/es dans un tableau, attends ma validation puis applique page par page. |
| Menu | Ajoute au menu « … » (fr « … », es « … ») vers /… en 3e position. / Retire l'élément vers /…. |
| Footer | Dans le footer, remplace le téléphone par … et le copyright par « … » ; ne touche à rien d'autre. |
| Thème | Change la couleur primaire en #…. |
| Annonce | Active le bandeau d'annonce « … » avec lien vers /tours « Voir les tours ». / Désactive le bandeau. |
| Article de blog | Rédige et enregistre en brouillon un article de 800 mots « … » (H2, conseils pratiques, conclusion avec appel à contacter Amon Tour), catégorie …, tags …, extrait 160 car., SEO anglais title/description, couverture /media/…. |
| Publier l'article | Passe l'article <slug> en publié avec la date d'aujourd'hui. |
| Média | Envoie cette image dans le dossier « blog » sous le nom …jpg, alt « … », puis utilise-la comme couverture de l'article <slug>. (max 5 Mo) |
| Traductions | Quelles traductions manquent en fr/es sur la page <slug> ? Traduis titre et sous-titre de la section <id> et enregistre-les. |
| Tours à la une | Sur la page d'accueil, ajoute une section Tour Ninja « Nos coups de cœur » avec les tours <id1>, <id2> après la section <id>. |
| Image d'un tour | Remplace l'image affichée pour le tour <id Tour Ninja> par <url https ou /media/…>. |
| Redirection | Ajoute une 301 de /ancienne-page vers /tours. |
| Aperçu | Avant d'enregistrer, montre un aperçu en français de la page <slug> si je remplaçais le titre de la section <id> par « … ». |
| Statut | Quel est le statut de publication ? / Relance la publication du site. |
| Historique | Montre les 10 dernières modifications de contenu avec le lien du commit. |
| Retour arrière | Remets le titre SEO anglais de la page <slug> tel qu'il était avant le commit « … ». |
| Supprimer | Supprime la page <slug> (ou la section <id>, ou l'article <slug>) — confirme-moi d'abord son contenu. |


## À retenir
- Chaque modification = un commit GitHub, publié en 1 à 3 min. Ajouter « **en mode pull request** » pour proposer sans publier.
- Anglais = version de référence ; FR/ES = surcharges. Une seule URL indexée par page.
- Commencer par un inventaire (pages, sections) pour obtenir les identifiants.
- « Montre-moi un aperçu avant d'enregistrer » = essai sans commit.


## Restaurer une version
GitHub → *commits/main/content* → ouvrir le commit fautif → **Revert** → **Merge pull request** → attendre le pipeline (lien « Publications ») → dans l'assistant : « Quel est le statut de publication ? ».
