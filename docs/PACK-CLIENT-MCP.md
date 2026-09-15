# Pack client — Piloter amon-tour.com depuis Claude ou ChatGPT

Version du 15 septembre 2026. Document destiné à l'équipe Amon Tour.

Ce pack contient : les liens de production, la procédure de branchement du CMS
dans Claude et dans ChatGPT, et une bibliothèque de prompts prêts à copier pour
gérer le site (pages, sections, SEO, menu, pied de page, thème, blog, médias,
traductions, tours mis en avant, publication, retour arrière).

---

## 1. Liens de production

| Élément | URL |
|---|---|
| Site public | `https://www.amon-tour.com` |
| Serveur MCP (connecteur) | `https://www.amon-tour.com/mcp` |
| Serveur MCP, variante « jeton dans l'URL » | `https://www.amon-tour.com/mcp/t/<JETON>` |
| Vérification de santé du MCP | `https://www.amon-tour.com/mcp/health` → `{"ok":true,"service":"amon-tour-cms-mcp"}` |
| Dépôt GitHub (contenu + code) | `https://github.com/atleastsoftware/Amon-Tour-2025` |
| Historique des modifications | `https://github.com/atleastsoftware/Amon-Tour-2025/commits/main` |
| Suivi des publications (GitHub Actions) | `https://github.com/atleastsoftware/Amon-Tour-2025/actions` |
| Catalogue Tour Ninja tel que le site le lit | `https://www.amon-tour.com/api/proxy/tours?language=fr` |

Le jeton `<JETON>` (variable `MCP_AUTH_TOKEN`) est remis séparément, jamais par
écrit dans ce document ni dans une conversation partagée. Toute personne qui
possède l'URL avec le jeton peut modifier le site : traitez-la comme un mot de passe.

### Préalables (côté technique, une seule fois)

Le connecteur ne répond qu'une fois ces trois conditions réunies :

1. Le site est **republié** avec la nouvelle version (serveur « edge »). Test :
   `https://www.amon-tour.com/mcp/health` doit renvoyer du JSON et non la page d'accueil.
2. Le secret `MCP_AUTH_TOKEN` est défini sur la publication.
3. Les secrets `GITHUB_TOKEN` (droits Contents + Pull requests + Actions en
   lecture/écriture sur le dépôt) et `GITHUB_REPO=atleastsoftware/Amon-Tour-2025`
   sont définis, sinon les modifications restent locales au serveur et ne sont
   pas versionnées sur GitHub.

---

## 2. Brancher le CMS dans Claude

1. Claude (web ou application) → **Paramètres → Connecteurs → Ajouter un connecteur personnalisé**.
2. Nom : `Amon Tour CMS`.
3. URL : `https://www.amon-tour.com/mcp/t/<JETON>`.
   Si votre version de Claude propose des en-têtes personnalisés, préférez l'URL
   `https://www.amon-tour.com/mcp` avec l'en-tête `Authorization: Bearer <JETON>`.
4. Ajouter, puis dans une nouvelle conversation activer le connecteur (icône outils).
5. Test : `Liste les pages du site Amon Tour.` → Claude appelle `list_pages` et
   affiche la liste (accueil, tours, contact, become-partner, etc.).

## 3. Brancher le CMS dans ChatGPT

1. ChatGPT → **Paramètres → Connecteurs → Avancé → activer le Mode développeur**.
2. **Créer** un connecteur : nom `Amon Tour CMS`, URL du serveur MCP
   `https://www.amon-tour.com/mcp/t/<JETON>`, authentification **Aucune**
   (le jeton est dans l'URL). Si « En-tête personnalisé » est disponible, utilisez
   `https://www.amon-tour.com/mcp` + en-tête `Authorization: Bearer <JETON>`.
3. Nouvelle conversation → **Outils** → activer `Amon Tour CMS`.
4. Même test que pour Claude : `Liste les pages du site Amon Tour.`

Si l'assistant répond « 401 » ou « non autorisé » : le jeton est faux ou absent.
Si la réponse est une page HTML : le site n'a pas encore été republié (§1, préalables).

---

## 4. Comment le CMS fonctionne (à savoir avant de l'utiliser)

- Chaque modification acceptée = **un commit GitHub sur `main`** avec un message
  explicite (l'envoi d'un média en produit deux). Le site se reconstruit ensuite
  via GitHub Actions ; le serveur recharge le contenu publié périodiquement
  (jusqu'à 10 minutes). Si vous êtes pressé, demandez `Relance la publication`.
- Vous pouvez demander une **pull request** au lieu d'un commit direct
  (« …propose-le en pull request ») : rien n'est publié tant que la PR n'est pas
  fusionnée sur GitHub. Exception : l'envoi de médias écrit toujours sur `main`.
- Le contenu est validé avant écriture : un type de section inconnu, une
  structure invalide ou une langue non gérée (langues : `en`, `fr`, `es`) est
  refusé sans rien casser. En revanche le HTML saisi dans un bloc texte est
  publié tel quel : ne collez jamais de code (script, iframe) venant d'un tiers.
- **Les suppressions sont immédiates** : l'assistant ne demande pas de
  confirmation de lui-même. Écrivez toujours « montre-moi d'abord, puis attends
  mon accord » dans le prompt (c'est le cas dans tous les prompts ci-dessous).
- **Les tours ne sont pas modifiables ici.** Le catalogue, les prix, les détails
  et la réservation restent gérés dans Tour Ninja. Le CMS peut seulement lire le
  catalogue et choisir les images/tours mis en avant.
- Jamais de force-push : l'historique GitHub est intact et tout retour arrière
  est un nouveau commit. L'assistant voit l'historique des commits (messages,
  dates, liens) mais ne relit pas les anciennes versions : pour annuler, on lui
  redonne la valeur souhaitée, ou on utilise « Revert » sur GitHub (§5.11).

Identifiants utiles : les pages sont désignées par leur **slug** (`home`,
`tours`, `contact`, `custom-tour`, `blog`, `become-partner`…) et les articles de
blog par leur slug d'URL.

---

## 5. Bibliothèque de prompts

Copiez-collez tel quel, adaptez ce qui est entre crochets. La colonne « Outils »
indique ce que l'assistant appellera ; « Attendu » ce que vous devez voir.

### 5.1 Découvrir le site

| Prompt | Outils | Attendu |
|---|---|---|
| `Liste toutes les pages du site avec leur URL, leur statut actif/inactif et leur nombre de sections.` | `list_pages` | Tableau des pages. |
| `Montre-moi la structure de la page tours : toutes ses sections dans l'ordre, avec leur type et leur titre.` | `list_sections` | Liste ordonnée des sections. |
| `Quels types de sections puis-je ajouter à une page ? Explique chacun en une phrase.` | `list_section_types` | Liste des types (hero, texte, grille de tours, témoignages, FAQ, formulaire…). |
| `Montre-moi le menu de navigation actuel et le contenu du pied de page.` | `get_navigation`, `get_footer` | Menu (3 langues) et coordonnées/liens du footer. |
| `Quelles sont les 10 dernières modifications faites sur le site, par qui et quand ?` | `get_commit_history` | Liste des commits avec message, date et lien GitHub. |

### 5.2 Pages

| Prompt | Outils | Attendu |
|---|---|---|
| `Crée une nouvelle page "Séminaires à Krabi" (slug seminaires-krabi, type secondary) avec un hero, une section texte de présentation en français et en anglais, et le formulaire de contact, puis désactive-la immédiatement : je veux la relire avant mise en ligne.` | `list_section_types`, `create_page`, `add_section`, `update_page` | Page créée puis passée inactive (une page nouvelle est active par défaut). |
| `Active la page seminaires-krabi et ajoute-la au menu après "Tours".` | `update_page`, `update_navigation` | Page visible, entrée de menu ajoutée. |
| `Renomme la page contact en "Contact Amon Tour" (nom interne) et mets à jour le titre de son hero en français et en anglais.` | `update_page`, `update_section` | Nom interne (une seule valeur) et titres du hero modifiés. |
| `Désactive la page [slug] sans la supprimer.` | `update_page` | Page hors ligne. Les pages techniques historiques (ex. become-partner) restent servies par une route dédiée : demandez une redirection (§5.10) si besoin. |
| `Montre-moi le contenu complet de la page [slug] et attends mon accord explicite avant de la supprimer définitivement.` | `get_page`, puis `delete_page` après votre « oui » | Suppression + redirection à prévoir (voir 5.10). |

### 5.3 Sections d'une page

| Prompt | Outils | Attendu |
|---|---|---|
| `Sur la page home, ajoute à la fin une section texte intitulée "Nouveautés 2026" avec deux phrases en français, sa traduction anglaise et espagnole.` | `add_section` | Section ajoutée, visible dans les 3 langues. |
| `Sur la page tours, remonte la section témoignages juste sous le hero.` | `list_sections`, `move_section` | Ordre modifié. |
| `Modifie le texte de la section [id ou titre] de la page home : remplace "[ancien]" par "[nouveau]" en français uniquement.` | `get_section`, `update_section` | Texte modifié en FR seulement. |
| `Change le bouton du hero de la page d'accueil : libellé "Voir nos excursions" et lien vers /tours.` | `update_section` | CTA modifié. |
| `Montre-moi le contenu de la section [id] de la page [slug] et attends mon accord avant de la supprimer.` | `get_section`, puis `delete_section` | Section supprimée après votre accord. |
| `Avant de committer, montre-moi un aperçu HTML de la page home avec le plan des titres H1/H2.` | `preview_page` | Aperçu et plan des titres, aucun commit. |

### 5.4 SEO

| Prompt | Outils | Attendu |
|---|---|---|
| `Fais un audit SEO de toutes les pages : titres et descriptions manquants ou trop longs (titre > 60 caractères, description > 155), dans les trois langues. Présente un tableau et propose des corrections sans rien modifier.` | `seo_audit` | Tableau + propositions, aucun commit. |
| `Applique les corrections SEO proposées pour la page tours en français et en anglais.` | `update_seo` | Titles/descriptions mis à jour, commit. |
| `Montre-moi le SEO actuel de la page contact en espagnol.` | `get_seo` | Title, description, mots-clés, image OG, canonical, robots. |
| `Pour la page home en français : titre "Excursions privées à Krabi — Amon Tour", description "[texte]", image de partage /media/[fichier].jpg.` | `update_seo` | SEO modifié. |
| `Passe la page [slug] en noindex (elle ne doit plus apparaître dans Google) sans la désactiver.` | `update_seo` | Balise robots noindex, page toujours accessible. |
| `Rédige un plan de titres et descriptions SEO cohérent pour toutes les pages, en FR/EN/ES, orienté "excursions privées Krabi, familles, francophones". Montre-le-moi, puis applique-le page par page après mon accord.` | `list_pages`, `get_seo`, `update_seo` | Plan proposé puis appliqué progressivement. |

### 5.5 Menu, pied de page, thème, annonces

| Prompt | Outils | Attendu |
|---|---|---|
| `Renomme l'entrée de menu "Cruise" en "Croisières" en français et "Cruises" en anglais.` | `get_navigation`, `update_navigation` | Libellés modifiés. |
| `Ajoute au menu un lien "Blog" vers /blog en dernière position.` | `update_navigation` | Entrée ajoutée. |
| `Retire "Villas" du menu principal (la page reste accessible).` | `update_navigation` | Entrée retirée. |
| `Dans le pied de page, mets à jour le numéro WhatsApp : [+66 ...] et l'adresse e-mail [contact@...].` | `get_footer`, `update_footer` | Coordonnées modifiées, lien WhatsApp cliquable. |
| `Ajoute notre compte TikTok [URL] aux réseaux sociaux du pied de page.` | `update_footer` | Icône/lien ajouté. |
| `Montre-moi les couleurs actuelles du thème, puis change la couleur primaire en #0B5D7A.` | `get_theme`, `update_theme` | Couleurs affichées puis modifiées. |
| `Affiche une barre d'annonce en haut du site : "Promo mousson : -10 % sur les excursions privées jusqu'au 31 octobre" avec un lien vers /tours.` | `update_announcements` | Barre visible sur tout le site (texte unique, non traduit par langue). |
| `Désactive la barre d'annonce et la popup marketing.` | `update_announcements` | Annonces masquées. |

### 5.6 Blog

| Prompt | Outils | Attendu |
|---|---|---|
| `Liste les articles du blog avec leur statut (brouillon / publié / archivé) et leur date.` | `list_blog_posts` | Liste. |
| `Crée un brouillon d'article "Kayak dans la mangrove d'Ao Thalane" : 600 mots en français, ton chaleureux, 4 intertitres, une FAQ de 3 questions, catégorie "Excursions", tags "kayak, mangrove, Krabi". Propose aussi le titre SEO et la méta-description. Ne le publie pas.` | `create_blog_post` | Brouillon créé, absent du site et du sitemap. |
| `Montre-moi l'article kayak-ao-thalane, corrige les fautes d'orthographe et montre-moi les corrections avant d'enregistrer.` | `get_blog_post`, `update_blog_post` | Corrections appliquées. |
| `Publie l'article kayak-ao-thalane aujourd'hui.` | `update_blog_post` | Statut publié, visible sur /blog et dans le sitemap. |
| `Crée la version anglaise de l'article kayak-ao-thalane sous le slug kayak-ao-thalane-en, langue en.` | `get_blog_post`, `create_blog_post` | Un article de blog a une seule langue : la traduction est un second article. |
| `Archive l'article [slug] (il ne doit plus être visible mais je veux le garder).` | `update_blog_post` | Statut archivé. |
| `Montre-moi l'article [slug] et attends mon accord avant de le supprimer.` | `get_blog_post`, puis `delete_blog_post` | Suppression après votre accord. |

### 5.7 Médias

| Prompt | Outils | Attendu |
|---|---|---|
| `Liste les images de la médiathèque contenant "railay" dans leur nom.` | `list_media` | Liste avec URL et texte alternatif. |
| `Téléverse cette image (ci-jointe) sous le nom railay-sunset-2026.jpg avec le texte alternatif "Coucher de soleil sur Railay", puis utilise-la comme image de couverture de l'article [slug].` | `upload_media`, `update_blog_post` | Image en ligne (max 5 Mo, toujours committée sur main), article mis à jour. Texte alternatif : une seule valeur. |
| `Où est utilisée l'image /media/[fichier].jpg sur le site ?` | `find_media_usages` | Liste des pages/sections/articles. |
| `Mets à jour le texte alternatif de /media/[fichier].jpg : "[texte]".` | `update_media_metadata` | Alt modifié. |

### 5.8 Traductions

| Prompt | Outils | Attendu |
|---|---|---|
| `Quels textes de la page d'accueil n'ont pas de traduction espagnole ?` | `list_missing_translations` | Liste des champs manquants. |
| `Traduis en espagnol tous les textes manquants de la page home, montre-moi le résultat, puis enregistre après mon accord.` | `list_missing_translations`, `update_translations` | Traductions proposées puis enregistrées. |
| `Montre-moi les libellés d'interface (boutons, menus) en anglais et corrige "Book now" en "Reserve now" partout.` | `get_translations`, `update_translations` | Libellés modifiés. |

### 5.9 Tours Tour Ninja (lecture seule + images mises en avant)

| Prompt | Outils | Attendu |
|---|---|---|
| `Liste les tours actuellement disponibles dans Tour Ninja avec leur identifiant, leur nom et leur lien de réservation.` | `list_tour_ninja_tours` | Liste issue du catalogue Tour Ninja (source de vérité). |
| `Quelles images personnalisées sont définies pour le tour [id] ?` | `get_tour_image_overrides` | Images de remplacement actuelles. |
| `Remplace l'image principale du tour [id] sur notre site par /media/[fichier].jpg (le catalogue Tour Ninja reste inchangé).` | `set_tour_image_override` | Image locale utilisée sur le site pour ce tour. |

Rappel : pour modifier un prix, une description de tour, une disponibilité ou
la réservation, utilisez Tour Ninja directement ; le CMS refusera.

### 5.10 Formulaires et redirections

| Prompt | Outils | Attendu |
|---|---|---|
| `Liste les formulaires du site et leurs champs.` | `list_forms`, `get_form` | Formulaires contact, tour sur mesure, croisière, groupe, partenariat, célébration. |
| `Dans le formulaire de tour sur mesure, ajoute un champ optionnel "Budget approximatif" (liste : < 5 000 THB, 5 000–15 000 THB, > 15 000 THB).` | `update_form` | Champ ajouté. |
| `Liste les redirections en place.` | `list_redirects` | Liste ancienne URL → nouvelle URL. |
| `Ajoute une redirection permanente de /ancienne-page vers /tours.` | `add_redirect` | Redirection 301 active après rebuild. |
| `Supprime la redirection /ancienne-page.` | `remove_redirect` | Redirection retirée. |

### 5.11 Publication, vérification, retour arrière

| Prompt | Outils | Attendu |
|---|---|---|
| `Vérifie que tout le contenu du site est valide.` | `validate_content` | « OK » ou liste d'erreurs précises. |
| `Quel est l'état de publication ? Le site en ligne correspond-il au dernier commit ?` | `publish_status` | Dernier commit, état du build, version servie. |
| `Relance la publication du site.` | `trigger_rebuild` | Build déclenché, lien vers le suivi GitHub Actions. |
| `Montre-moi les 5 dernières modifications. Puis remets le titre SEO français de la page tours à "[ancienne valeur]".` | `get_commit_history`, `update_seo` | Nouveau commit qui rétablit la valeur indiquée (jamais de force-push). L'assistant ne lit pas les anciennes versions : donnez-lui la valeur à rétablir, ou utilisez Revert sur GitHub. |
| `Propose la modification suivante en pull request au lieu de la publier directement : [demande].` | outil concerné avec `commitMode: pr` | Lien vers la PR GitHub ; rien en ligne avant fusion. |

Retour arrière complet (cas grave) : sur GitHub, ouvrir
`https://github.com/atleastsoftware/Amon-Tour-2025/commits/main`, choisir le
commit fautif, « Revert », fusionner. Le site se republie automatiquement.

---

## 6. Garde-fous

Le CMS refuse :

- les types de sections inconnus, les structures invalides, les langues autres
  que FR/EN/ES ;
- la modification des clés Tour Ninja, du domaine, des routes techniques
  (`/api/...`, `/mcp`) et de la réservation : hors périmètre ;
- tout force-push ou réécriture d'historique.

Ce que le CMS **ne** vérifie **pas** (à votre charge) :

- les suppressions sont exécutées sans confirmation : toujours écrire « montre-moi
  d'abord et attends mon accord » ;
- le HTML collé dans un bloc texte ou un article est publié tel quel : jamais de
  code provenant d'un tiers ; les liens doivent être en https.

Bonnes pratiques :

1. Une demande = un sujet (une page, un article). Les longues listes en un seul
   prompt donnent des commits difficiles à annuler.
2. Demandez un aperçu (`prévisualise`) avant de committer les gros changements.
3. Pour les changements sensibles (accueil, menu), utilisez la pull request.
4. Après publication, attendez 2–3 minutes puis vérifiez la page en navigation privée.
5. Ne partagez jamais l'URL contenant le jeton dans une conversation partagée
   publiquement ; si elle fuit, demandez la rotation du jeton (nouveau
   `MCP_AUTH_TOKEN`, puis mise à jour du connecteur dans Claude/ChatGPT).

---

## 7. État de validation

- Tous les outils listés ci-dessus existent dans le serveur MCP (57 outils).
  La suite `npm run test:migration` vérifie leur enregistrement et exerce en
  profondeur le SEO, les sections, l'aperçu, l'état de publication et le catalogue.
- Les prompts de lecture (§5.1, 5.4 audit, 5.9 catalogue, 5.11 état) ont été
  rejoués le 15 septembre 2026 contre le serveur MCP local (transport Streamable
  HTTP, jeton dans l'URL) : liste des pages, audit SEO, navigation, catalogue
  Tour Ninja réel, historique des commits — tous renvoient les données attendues,
  et un mauvais jeton renvoie bien 401.
- La validation finale **depuis Claude et ChatGPT sur l'URL de production** se
  fait après republication (tâche « Mettre le nouveau site en ligne ») en
  suivant `docs/migration/VALIDATION-MCP.md` §B ; ce pack sera alors réutilisé
  tel quel, seules les captures d'écran seront à ajouter.
