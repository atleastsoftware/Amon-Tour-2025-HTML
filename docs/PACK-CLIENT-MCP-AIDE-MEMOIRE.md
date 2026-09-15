# Amon Tour CMS — aide-mémoire (1 page)

**Connecteur** : `https://www.amon-tour.com/mcp/t/<JETON>` (jeton remis à part, à garder secret)
**Test** : `https://www.amon-tour.com/mcp/health` → `{"ok":true,"service":"amon-tour-cms-mcp"}`
**Historique / annulation** : https://github.com/atleastsoftware/Amon-Tour-2025/commits/main
**Suivi des publications** : https://github.com/atleastsoftware/Amon-Tour-2025/actions

**Brancher** — Claude : Paramètres → Connecteurs → Ajouter un connecteur personnalisé → coller l'URL.
ChatGPT : Paramètres → Connecteurs → Avancé → Mode développeur → Créer → URL, auth « Aucune ».
Puis dans la conversation : activer « Amon Tour CMS » et écrire `Liste les pages du site.`

**Règles** : chaque modification = un commit GitHub + republication (jusqu'à 10 min ; `Relance la publication` pour accélérer).
Les tours, prix et réservations se gèrent dans Tour Ninja, pas ici.
Langues : FR / EN / ES. Les suppressions sont immédiates : toujours écrire « montre-moi d'abord et attends mon accord ». Ne collez jamais de code HTML venant d'un tiers.

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
