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

# Pack client — Piloter amon-tour.com depuis Claude ou ChatGPT (MCP)

Version du 15 septembre 2026. Aide-mémoire d'une page : `docs/PACK-CLIENT-MCP-AIDE-MEMOIRE.md`.

Ce pack permet à l'équipe Amon Tour de gérer le contenu du site (pages, SEO, blog,
menu, thème, médias, traductions, mises en avant Tour Ninja) en langage naturel,
depuis Claude ou ChatGPT. Chaque modification devient un **commit GitHub** ; le
site est regénéré et publié automatiquement.

---


### Le jeton d'accès

- Le MCP est protégé par un **jeton d'accès** (`MCP_AUTH_TOKEN`). Il est remis au
  client **séparément de ce document** (gestionnaire de mots de passe, message
  éphémère). Il n'apparaît jamais en clair ici ni dans le dépôt GitHub.
- Qui possède le jeton peut modifier le site. Ne le collez jamais dans un e-mail,
  un ticket ou un prompt partagé.
- En cas de doute (jeton exposé, départ d'un collaborateur) : changer la valeur
  du secret `MCP_AUTH_TOKEN` dans le déploiement Replit et republier ; tous les
  connecteurs devront être reconfigurés avec le nouveau jeton.
- Deux façons de transmettre le jeton :
  1. **En-tête** (recommandé) : `Authorization: Bearer <jeton>` sur l'URL `https://amon-tour.com/mcp`.
  2. **Dans l'URL** (si le client ne permet pas d'en-tête personnalisé) :
     `https://amon-tour.com/mcp/t/<jeton>`. Cette URL vaut mot de passe : la
     traiter comme tel.

---


### 4.3 Éditer les sections d'une page

**Ajouter**
> Sur la page tours, ajoute à la fin une section texte intitulée « Nouveautés 2026 » avec ce contenu : « Découvrez nos nouvelles sorties privées en catamaran au départ d'Ao Nang. » Fournis aussi la version française du titre : « Nouveautés 2026 ».

*Outil* : `add_section` (`type: "text"`, `props`, `i18n.fr`). *Résultat attendu* :
commit `cms(sections): section text_<horodatage> ajoutée à tours`. Le nouvel
identifiant apparaît dans le résumé ; notez-le.

**Ajouter à un endroit précis**
> Sur la page contact, insère juste après la section hero une bannière d'appel à l'action « Réservez par WhatsApp », texte « Réponse en moins d'une heure », bouton « Écrire sur WhatsApp » vers https://wa.me/<numéro>.

*Outil* : `add_section` (`type: "cta_banner"`, `afterSectionId`).

**Modifier**
> Dans la section text_1760111834681 de la page d'accueil, remplace le titre par « When expats welcome you to their host country » sans toucher au reste.

*Outil* : `update_section` (`props` partiel). *Résultat attendu* : seul le champ
indiqué change ; les traductions existantes sont conservées.

**Déplacer / masquer**
> Remonte la section « Why Choose Us » de la page d'accueil en 2e position.
> Masque temporairement la section who_we_are_1760273103820 sans la supprimer.

*Outils* : `move_section` (`order`), `update_section` (`active: false`).

**Supprimer**
> Supprime la section text_1789… de la page tours. Montre-moi son contenu avant.

*Outil* : `get_section` puis `delete_section`.

*Piège général* : un type de section inconnu (ex. « carrousel 3D ») est **refusé**
par le MCP avec la liste des types autorisés ; demandez d'abord
`list_section_types`.


## 5. Restaurer une version depuis GitHub

1. Ouvrir `https://github.com/atleastsoftware/Amon-Tour-2025/commits/main/content`.
2. Cliquer sur le commit fautif (message `cms(...) [via MCP]`).
3. Bouton **Revert** (en haut à droite de la page du commit) → GitHub crée une
   pull request « Revert "cms(...)" ».
4. Vérifier les fichiers modifiés, puis **Merge pull request**.
5. Le pipeline `content-ci` se relance automatiquement ; suivre sur
   `https://github.com/atleastsoftware/Amon-Tour-2025/actions/workflows/content-ci.yml`.
6. Dans l'assistant : « Quel est le statut de publication ? » pour confirmer que le
   site sert le nouveau commit. Si besoin : « Relance la publication ».

Pour revenir **plusieurs commits en arrière**, répéter le revert du plus récent
au plus ancien, ou demander à un développeur de créer une PR de restauration à
partir du tag `pre-migration-2026-09-15` ou d'un commit donné. Aucun
`force-push` n'est jamais nécessaire ni autorisé.

---


### 4.8 Blog

**Inventaire**
> Liste les articles publiés du blog avec leur date, leur catégorie et leur extrait. Liste aussi les catégories et les tags disponibles.

*Outils* : `list_blog_posts` (`status`), `list_blog_categories`, `list_blog_tags`.

**Article complet avec SEO**
> Rédige et publie un article de blog de 800 mots en anglais « Railay Beach: how to get there from Ao Nang », structuré en H2, avec une introduction, 4 sections pratiques (bateau long-tail, horaires, prix indicatifs, conseils), une conclusion avec appel à contacter Amon Tour. Catégorie : tours-and-excursions ; tags : krabi, railay. Extrait de 160 caractères. SEO anglais : title de 55 caractères, description de 150 caractères. Image de couverture : /media/brand/logo-amon.png. Statut : brouillon d'abord.

*Outil* : `create_blog_post` (`content` en Markdown, `seo: { en: { title, description } }`).
*Résultat attendu* : commit `cms(blog): article railay-beach-how-to-get-there-from-ao-nang créé` ;
le slug est dérivé du titre si non fourni. *Pièges* : le `seo` doit être
**par langue** (`{ en: … }`), sinon « Validation du contenu refusée » (vérifié) ;
un slug existant est refusé.

**Publier / modifier**
> Passe l'article railay-beach-how-to-get-there-from-ao-nang en publié avec la date d'aujourd'hui.
> Corrige le 2e paragraphe de l'article … : remplace « 150 THB » par « 200 THB ».

*Outil* : `update_blog_post` (`patch` pour le front matter, `content` pour le corps).

**Catégories / tags**
> Crée la catégorie « Practical guides » et le tag « railay ».

*Outils* : `create_blog_categorie` (nom réel de l'outil, singulier tronqué —
l'assistant le trouve seul), `create_blog_tag`.

**Supprimer**
> Supprime l'article … après m'avoir montré son titre et sa date.

*Outil* : `delete_blog_post`.


### 4.15 Publication et statut

> Quel est le statut de publication ? Dernier commit, exécutions du pipeline, version servie par le site.

*Outil* : `publish_status`. *Résultat attendu* : `repository.headSha`,
`lastCommit`, `ciRuns` (nom, statut, conclusion, URL GitHub Actions) et `edge`
(sha synchronisé, `syncedAt`, `builtAt`, liste des routes).

> Relance la publication du site.

*Outil* : `trigger_rebuild`. *Résultat attendu* : le serveur resynchronise
`content/` et regénère les pages ; renvoie `sha`, `builtAt`, `routes`. À utiliser si
le site n'a pas repris un commit après quelques minutes.

> Fais cette modification en mode pull request plutôt que directement sur main : …

*Tout outil d'écriture* avec `commitMode: "pr"`. *Résultat attendu* : `branch`
`cms/<zone>-<horodatage>` et `prUrl`. Publication uniquement après fusion de la PR.


### 2.1 Dans Claude (web ou application de bureau)

1. Ouvrir **Settings → Connectors** (Paramètres → Connecteurs).
2. Cliquer **Add custom connector** (Ajouter un connecteur personnalisé).
3. Nom : `Amon Tour CMS`.
4. URL du serveur MCP : `https://amon-tour.com/mcp`.
5. Ouvrir les options avancées et ajouter l'en-tête `Authorization` avec la valeur
   `Bearer <jeton>`. Si l'écran ne propose pas d'en-tête, utiliser à la place
   l'URL `https://amon-tour.com/mcp/t/<jeton>` sans authentification.
6. Enregistrer. Dans une nouvelle conversation, activer le connecteur
   (icône « + » ou « Outils » → Amon Tour CMS).
7. Test : envoyer le prompt **« Liste toutes les pages du site avec leur URL et leur nombre de sections. »**
   Claude doit appeler l'outil `list_pages` et afficher une quinzaine de pages
   (`/`, `/tours`, `/contact`, `/blog`, `/cruise`, `/villas-krabi`, …).

Le connecteur expose 57 outils. Claude choisit lui-même le bon outil à partir de
votre phrase ; il n'est pas nécessaire de connaître leurs noms.


## 2. Brancher le connecteur


### 4.14 Prévisualiser avant de publier

> Avant d'enregistrer, montre-moi un aperçu en français de la page tours si je remplaçais le titre de la section text_1789… par « Titre en attente » : plan des titres H1/H2 et balises title/description.

*Outil* : `preview_page` (`page`, `lang`, `pendingPatch: { sectionId, props }`).
*Résultat attendu* : HTML rendu, `outline` (H1/H2), `title`, `description`, **sans
commit**. C'est le seul outil qui permet d'essayer sans écrire.


### 4.16 Retour arrière

Le MCP n'a **pas d'outil « revert »** : il ne réécrit jamais l'historique. Deux
méthodes :

1. **Depuis l'assistant** (petites corrections) :
   > Montre les 5 derniers commits de contenu. Remets le titre SEO anglais de la page tours tel qu'il était avant le commit « cms(seo): … ».

   L'assistant relit la valeur précédente (GitHub) et applique un **nouveau**
   commit. L'historique reste complet.
2. **Depuis GitHub** (toute modification, y compris suppressions) : voir §5.

---


## 6. Garde-fous : ce que le MCP refuse ou ne sait pas faire

| Situation | Comportement |
|---|---|
| Suppression massive | Aucun outil de suppression en masse. Chaque suppression = 1 appel = 1 commit visible dans l'historique. Formulez vos prompts avec « confirme-moi d'abord » ; ChatGPT demande de toute façon une confirmation par écriture. |
| Clés Tour Ninja (`apiKey` vitrine, `companyId`, clé de synchronisation) | Non exposées : elles vivent dans les secrets du serveur, aucun outil ne les lit ni ne les modifie. Le MCP ne peut pas non plus modifier un tour, un prix ou une réservation chez Tour Ninja. |
| Force-push, réécriture d'historique, suppression de branche | Impossible : le serveur ne fait que des commits « fast-forward » sur `main` ou des branches `cms/...` + PR. |
| Contenu invalide (type de section inconnu, `seo` sans `en`, JSON incomplet) | Refusé avant tout commit, message « Validation du contenu refusée … » ou « Invalid enum value … » avec la liste des valeurs admises. Le site reste inchangé. |
| Fichier hors de `content/` ou `media/manifest.json` (code, configuration, workflow) | Refusé (« Chemin non autorisé »). Le CMS ne touche jamais au code du site. |
| Média > 5 Mo | Refusé. Réduire l'image avant envoi. |
| Doublons (slug de page, d'article, source de redirection) | Refusés. |
| Page ou section inexistante | « Page introuvable » / « Section introuvable ». |
| Requête sans jeton | 401. |

Ce que le MCP **ne fait pas** (hors périmètre) : gestion des demandes clients
reçues par formulaire (base de données), envoi d'e-mails, paiement, statistiques,
comptes utilisateurs, modification du design au-delà du thème (couleurs,
typographie, boutons).

---


### 4.11 Traductions

> Quelles traductions manquent en français et en espagnol sur la page d'accueil ?

*Outil* : `list_missing_translations` (`page`). *Résultat attendu* : liste
`{ sectionId, lang, key }`. Beaucoup de clés listées sont techniques (`videoUrl`,
`backgroundImage`) : ne traduire que les textes visibles (title, subtitle, content…).

> Traduis en français et en espagnol le titre et le sous-titre de la section hero_1760097856557 de la page d'accueil, puis enregistre-les.

*Outil* : `update_section` (`i18n: { fr: {…}, es: {…} }`).

> Dans les libellés d'interface français, remplace « Réserver » par « Réserver maintenant ».

*Outils* : `get_translations` (`lang`, `section`) puis `update_translations`
(`patch` fusionné en profondeur : seules les clés fournies changent).


### 4.4 SEO d'une page

**Lire**
> Donne-moi le SEO actuel de la page tours dans les trois langues (title, description, image OG, canonical, noindex).

*Outil* : `get_seo`. *Résultat attendu* : objet `{ en, fr, es }` ; beaucoup de pages
n'ont pas encore de titre/description dédiés (`{ "en": {} }` — le générateur
applique alors les valeurs par défaut du site).

**Modifier tout le SEO d'une page**
> Mets à jour le SEO anglais de la page cruise : title « Private Cruises from Krabi — Amon Tour » (moins de 60 caractères), description de 140 à 160 caractères orientée « croisière privée, îles de Krabi, guide francophone », image OG /media/brand/logo-amon.png, canonical https://amon-tour.com/cruise, indexable.

*Outil* : `update_seo` (`lang: "en"`, `seo: { title, description, ogImage, canonical, noindex: false }`).
*Résultat attendu* : commit `cms(seo): SEO en de cruise mis à jour`.

**Désindexer une page**
> Passe la page brochure en noindex et garde son canonical.

*Outil* : `update_seo` (`seo: { noindex: true }`). *Piège* : le `canonical` doit
être une URL absolue valide.

**Audit**
> Fais un audit SEO de toutes les pages : longueur des titres et descriptions, champs manquants, par langue. Propose les corrections prioritaires.

*Outil* : `seo_audit`. *Résultat attendu* : une ligne par page et par langue avec
`titleLength`, `descriptionLength`, `missing`. L'assistant propose ensuite des
textes ; chaque application = un `update_seo`.


### 2.3 Dépannage rapide

| Symptôme | Cause probable | Que faire |
|---|---|---|
| « Unauthorized » / 401 | Jeton absent ou faux | Vérifier l'en-tête `Authorization: Bearer …` ou l'URL `/mcp/t/…` |
| Le connecteur ne se connecte pas, page HTML renvoyée | Bascule du site pas encore faite | Attendre la mise en ligne du nouveau serveur ; tester `/mcp/health` |
| « nothing to commit » ou modification « sans effet » | La valeur demandée est déjà celle en place | Rien à faire |
| « Validation du contenu refusée … » | Champ invalide (ex. `seo` sans `en`, type de section inconnu) | Reformuler ; l'assistant peut appeler `list_section_types` |
| Le site n'a pas changé après le commit | Pipeline en cours (1 à 3 min) | Demander « Quel est le statut de publication ? » ou ouvrir le suivi des publications |

---


## 3. Comment ça marche (à savoir avant d'écrire)

- **Langues** : le contenu canonique est en anglais (`en`) ; le français (`fr`) et
  l'espagnol (`es`) sont des surcharges optionnelles. Le SEO se règle par langue.
  Seules les URL anglaises sont indexées (`/fr/...` et `/es/...` sont `noindex`) :
  c'est le contrat SEO historique du site, à ne pas changer sans décision.
- **Pages** : identifiées par leur slug (`home`, `tours`, `contact`, `blog`,
  `cruise`, `villas-krabi`, `custom-tour`, `group-corporate`, `krabi-celebration`,
  `fun-garden`, `brochure`, `become-partner`, `legal-notice`, `privacy-policy`,
  `terms-conditions`). Une page est faite de **sections** typées (`hero`, `text`,
  `text_image`, `cta_banner`, `form`, `tour_ninja_section`, `popular_experiences`, …).
- **Chaque écriture = un commit** sur `main` du dépôt GitHub, message préfixé
  `cms(<zone>): … [via MCP]`. Puis le pipeline `content-ci` valide, reconstruit et
  publie. Comptez 1 à 3 minutes.
- **Mode proposition** : ajoutez « en mode pull request » à votre demande ;
  l'assistant crée une branche `cms/...` + une PR au lieu d'écrire sur `main`.
  Rien n'est publié tant que la PR n'est pas fusionnée sur GitHub.
- **Validation** : tout contenu est vérifié par le schéma du site avant commit.
  Un contenu invalide est refusé, le site reste intact.
- **Tours** : le catalogue, les prix et les réservations viennent de Tour Ninja en
  direct ; le CMS ne peut que les **afficher / mettre en avant / remplacer une image**,
  jamais modifier un tour ou un prix.

Conseil : commencez chaque session par un prompt d'inventaire (§4.1) pour que
l'assistant connaisse les slugs et identifiants de sections.

---


### 4.6 Navigation (menu) et footer

**Lire**
> Montre le menu principal actuel avec l'ordre, les libellés dans les 3 langues et les URL.

*Outil* : `get_navigation`.

**Ajouter / retirer / réordonner un élément**
> Ajoute au menu un élément « Diving » (fr : « Plongée », es : « Buceo ») vers /sejours-plongee, en 3e position.
> Retire du menu l'élément qui pointe vers /brochure.
> Place « Contact » en dernier.

*Outil* : `update_navigation` avec `operations` (`add` / `remove` / `reorder`).
*Résultat attendu* : commit `cms(navigation): navigation mis à jour` ; l'ordre est
renuméroté automatiquement. *Piège* : chaque élément a besoin de `label.en`
(fr/es optionnels), d'une `url` et d'un `id` unique.

**Footer**
> Dans le footer, mets à jour le numéro de téléphone en +66 … et le texte de copyright en « © 2026 Amon Tour — Flame BB Co., Ltd. ». Ne touche pas aux autres blocs.

*Outils* : `get_footer` puis `update_footer` (`patch` partiel ou `contactInfo`,
`usefulLinks`, `socialMedia`, `newsletter`, `copyright`). *Résultat attendu* :
commit `cms(footer): footer mis à jour`. *Piège* : pour modifier une seule ligne
de `contactInfo`, l'assistant doit renvoyer la liste complète (c'est un tableau).


### 4.9 Pages statiques et légales

> Liste les pages statiques. Mets à jour la meta description de la page about : « … » et remplace le paragraphe sur la licence TAT par « … ».

*Outils* : `list_static_pages`, `get_static_page`, `update_static_page`
(`title`, `metaTitle`, `metaDescription`, `body`, `published`). Pour une nouvelle
page légale : `create_static_page`.


### 2.2 Dans ChatGPT (mode développeur)

1. Ouvrir **Settings → Connectors** (Paramètres → Connecteurs).
2. Dans **Advanced**, activer **Developer mode**.
3. Cliquer **Create** / **Add MCP server**.
4. Nom : `Amon Tour CMS`. URL : `https://amon-tour.com/mcp`.
5. Authentification : **Custom header** → en-tête `Authorization`, valeur
   `Bearer <jeton>`. Si l'option n'existe pas dans votre version : choisir
   **No authentication** et saisir l'URL `https://amon-tour.com/mcp/t/<jeton>`.
6. Cocher « I trust this application », enregistrer.
7. Dans une conversation : **Tools → Amon Tour CMS**, puis le même prompt de test
   que ci-dessus.

ChatGPT demande une confirmation avant chaque outil qui écrit (commit). C'est
voulu : lisez le résumé proposé avant d'accepter.


### 4.12 Tours Tour Ninja : mise en avant et images

> Liste le catalogue Tour Ninja en français avec identifiant, nom, durée, prix et lien de réservation.

*Outil* : `list_tour_ninja_tours` (`language`, `fresh: true` pour ignorer le cache
de 24 h). *Résultat attendu* : tours avec `detailsUrl` / `bookUrl` vers
`tourninja.io`. Le prix peut valoir 0 si Tour Ninja ne le publie pas.

> Sur la page d'accueil, ajoute une section Tour Ninja « Nos coups de cœur » qui met en avant les tours VNbDPiuZIN et JfgH4lC6Ik, placée après la section text_1760111834681.

*Outil* : `add_section` (`type: "tour_ninja_section"`, `props: { title, selectedTourIds, categoryFilter }`).

> Remplace l'image affichée pour le tour JfgH4lC6Ik par https://…/mon-image.jpg (ou par le média /media/uploads/…). Puis liste toutes les images remplacées.

*Outils* : `set_tour_image_override` (`tourNinjaId`, `tourName`, `imageUrl`, `active`),
`get_tour_image_overrides`. *Piège* : cela ne modifie rien chez Tour Ninja ; c'est
une surcharge d'affichage locale, désactivable (`active: false`).


### 4.10 Médias

**Chercher / vérifier l'usage**
> Trouve tous les médias dont le nom contient « logo ». Où le fichier /media/brand/logo-amon.png est-il utilisé ?

*Outils* : `list_media` (`search`, `folder`), `find_media_usages`.
*Résultat attendu* : liste des fichiers de contenu qui référencent le chemin
(ex. `content/navigation.json`).

**Envoyer une image**
> Voici une image (jointe). Envoie-la dans le dossier « blog » sous le nom railay-longtail.jpg avec le texte alternatif « Long-tail boats at Railay Beach », puis utilise-la comme couverture de l'article railay-… .

*Outils* : `upload_media` (base64, **5 Mo maximum**) puis `update_blog_post`.
*Résultat attendu* : deux commits (fichier `media/uploads/AAAA/MM/railay-longtail.jpg`
+ index `media/manifest.json`), chemin public `/media/uploads/AAAA/MM/railay-longtail.jpg`.
*Pièges* : le nom est normalisé (minuscules, tirets) ; l'envoi de pièces jointes
en base64 dépend du client (Claude le fait, ChatGPT parfois non — dans ce cas
héberger l'image et donner son URL HTTPS).

**Métadonnées**
> Change le texte alternatif de /media/uploads/2026/09/railay-longtail.jpg en « … ».

*Outil* : `update_media_metadata`.


### 4.2 Créer, modifier, supprimer une page

**Créer**
> Crée une page secondaire « Séjours plongée » à l'adresse /sejours-plongee. Titre SEO anglais : « Diving Trips in Krabi — Amon Tour », description : « Private diving trips around Krabi and Koh Phi Phi with French and English speaking guides. » Ajoute une section hero avec le titre « Diving Trips in Krabi » puis une section texte d'introduction. Laisse-la inactive pour l'instant.

*Outils* : `create_page` puis `update_page` (`active: false`) ou `add_section`.
*Résultat attendu* : un commit `cms(pages): page sejours-plongee créée`, puis les
sections. *Pièges* : le `seo` doit contenir au minimum `en` ; un slug déjà pris est
refusé ; une page inactive n'est ni servie ni dans le sitemap.

**Modifier les métadonnées**
> Active la page sejours-plongee, inclus-la dans le sitemap avec une priorité de 0.6 et une fréquence mensuelle.

*Outil* : `update_page` (`active`, `sitemap: { include, priority, changefreq }`).

**Supprimer**
> Supprime la page sejours-plongee. Confirme-moi d'abord son URL et son nombre de sections avant de le faire.

*Outil* : `delete_page`. *Résultat attendu* : l'assistant récapitule puis un commit
`cms(pages): page … supprimée`. Une deuxième suppression renvoie « Page introuvable »
(vérifié). *Piège* : penser à retirer aussi l'entrée du menu (§4.5) et, si l'URL
était indexée, ajouter une redirection 301 (§4.13).


### 7.2 À rejouer en production après la bascule

| Date | Client | Scénario | Commit / PR | Résultat |
|---|---|---|---|---|
| | Script `mcp-pack-check.mjs` (`MCP_BASE=https://amon-tour.com`) | 70 appels | | |
| | Claude | §2.1 test + §4.4 `update_seo` sur une page de test | | |
| | ChatGPT | §2.2 test + §4.3 `add_section` puis `delete_section` | | |
| | GitHub | §5 revert d'un commit de test | | |

Le script crée puis supprime une page `test-pack-mcp` et un article, et restaure
lui-même le menu, le footer, le thème, les annonces, la page « about » et les
traductions. Il laisse en place (le MCP n'a pas d'outil pour les retirer) : une
catégorie de blog « Test pack », un tag `test-pack`, un média
`media/uploads/AAAA/MM/pixel-test.png` et une surcharge d'image Tour Ninja
`pack-test-id` (inactive, sans effet). Ces quatre résidus sont inoffensifs mais
visibles dans le dépôt ; les retirer par une PR de nettoyage après l'exécution en
production, ou n'exécuter le script qu'en environnement de développement
(`npm run edge:dev` avec `MCP_AUTH_TOKEN`, sans `GITHUB_TOKEN`).

## 1. Les liens à connaître

| Usage | URL |
|---|---|
| Site public | `https://amon-tour.com` |
| Serveur MCP (connecteur) | `https://amon-tour.com/mcp` |
| Vérification que le MCP répond | `https://amon-tour.com/mcp/health` → `{"ok":true,"service":"amon-tour-cms-mcp"}` |
| Dépôt GitHub (contenu versionné) | `https://github.com/atleastsoftware/Amon-Tour-2025` |
| Historique des modifications de contenu | `https://github.com/atleastsoftware/Amon-Tour-2025/commits/main/content` |
| Suivi des publications (pipeline `content-ci`) | `https://github.com/atleastsoftware/Amon-Tour-2025/actions/workflows/content-ci.yml` |
| Pull requests (mode « proposition ») | `https://github.com/atleastsoftware/Amon-Tour-2025/pulls` |

> **État au 15 septembre 2026** : ces URL sont celles de la configuration livrée
> (`edge/`, `mcp/`, `.github/workflows/content-ci.yml`). Le serveur MCP devient
> joignable sur `https://amon-tour.com/mcp` **après la bascule du site** vers le
> nouveau serveur (tâche « Mettre le nouveau site en ligne ») et une fois les
> secrets `MCP_AUTH_TOKEN`, `GITHUB_TOKEN` et `GITHUB_REPO` renseignés dans le
> déploiement. Avant cela, `https://amon-tour.com/mcp/health` renvoie encore la page
> d'accueil de l'ancien site (vérifié ce jour) : c'est normal, le connecteur ne
> fonctionnera pas encore.


### 4.1 Inventaire du site

**Prompt**
> Liste toutes les pages du site avec leur URL, leur type, si elles sont actives et leur nombre de sections.

*Outil* : `list_pages`. *Résultat attendu* : tableau de 15 pages (slug, chemin,
type main/secondary/legal, actif, `sectionCount`, réglages sitemap).

**Prompt**
> Montre-moi la structure de la page d'accueil : la liste ordonnée de ses sections avec leur identifiant, leur type et leur titre.

*Outil* : `get_page` (`page: "home"`). *Résultat attendu* : 12 sections
(`hero_…`, `text_…`, `popular_experiences_…`, `tour_ninja_section_…`,
`custom_tour_form_…`, `why_choose_us_…`, `who_we_are_…`). Les identifiants sont
à réutiliser dans les prompts suivants.

**Prompt**
> Quels types de sections puis-je ajouter et quelles propriétés attendent-ils ?

*Outil* : `list_section_types`. *Résultat attendu* : liste des types autorisés avec
les props connues (`hero` : title, subtitle, imageUrl, buttons ; `text` : title,
content ; `text_image` ; `cta_banner` : title, content, ctaText, ctaUrl ; `form` :
title, formId ; `tour_ninja_section` : title, categoryFilter, selectedTourIds).

**Prompt**
> Vérifie que tout le contenu du site est valide et dis-moi combien de fichiers il contient.

*Outil* : `validate_content`. *Résultat attendu* : `{ ok: true, fileCount: 67 }`.

**Prompt**
> Montre les 10 dernières modifications de contenu avec leur date, leur message et le lien du commit.

*Outil* : `get_commit_history` (`limit: 10`). *Résultat attendu* : liste de commits
`cms(...)` avec URL GitHub. Utile avant un retour arrière (§5).


## 4. Bibliothèque de prompts

Tous ces prompts ont été exécutés le 15 septembre 2026 contre le serveur MCP
livré (script `scripts/migration/mcp-pack-check.mjs`, 70 appels, 68 réussis, les
2 refus étant attendus — voir §6). Ils ont tourné sur une **copie du contenu de
production avec commits Git réels**, le serveur de production n'étant pas encore
basculé. À rejouer en production après la bascule (§7).

Convention : *Résultat attendu* décrit ce que l'assistant renvoie ; *Piège* ce qui
fait échouer ou surprend.


### 4.7 Thème et annonces

**Thème**
> Quelle est la palette actuelle du site ? Change la couleur primaire en #0A5A7C et laisse le reste inchangé.

*Outils* : `get_theme`, `update_theme` (`patch: { colors: { primary } }`).
*Résultat attendu* : commit `cms(theme): theme mis à jour`. *Piège* : si la valeur
demandée est déjà en place, aucun commit n'est créé (message « nothing to
commit » en développement).

**Bandeau d'annonce**
> Active le bandeau d'annonce avec le texte « Offre de saison : -10 % sur les sorties Phi Phi jusqu'au 30 novembre », lien vers /tours avec le libellé « Voir les tours ».
> Désactive le bandeau d'annonce.

*Outil* : `update_announcements` (`patch: { banner: { enabled, text, linkUrl, linkText } }`).
La barre de notification défilante se règle de la même façon via `notificationBar`
(`enabled`, `text`, `url`).


### 7.1 Réalisée le 15 septembre 2026 (copie du contenu de production, commits Git réels)

Commande : `MCP_BASE=http://127.0.0.1:<port> MCP_TOKEN=<jeton> node scripts/migration/mcp-pack-check.mjs`

| Catégorie | Appels | Résultat |
|---|---|---|
| Inventaire (`list_pages`, `get_page`, `list_section_types`, `validate_content`, `get_commit_history`) | 5 | OK — 15 pages, 67 fichiers valides |
| Pages (créer, modifier, supprimer, double suppression) | 4 | OK — la double suppression renvoie « Page introuvable » (attendu) |
| Sections (lister, ajouter ×2, lire, modifier, déplacer, type invalide, supprimer) | 8 | OK — le type invalide est refusé (attendu) |
| SEO (lire, fr complet avec canonical + noindex, OG image, audit) | 4 | OK |
| Navigation et footer (lire, add, remove, restaurer, lire footer, patch, restaurer) | 7 | OK |
| Thème et annonces (lire, patch couleur, restaurer, bannière on/off, restaurer) | 7 | OK |
| Blog (lister, catégories, tags, créer avec SEO, lire, publier, créer catégorie, créer tag, supprimer) | 9 | OK |
| Pages statiques (lister, lire, modifier, restaurer) | 4 | OK |
| Médias (chercher, envoyer PNG, métadonnées, usages) | 4 | OK — chemin `/media/uploads/2026/09/pixel-test.png` |
| Traductions (lire, manquantes, modifier, restaurer) | 4 | OK |
| Formulaires (lister, lire) | 2 | OK |
| Tour Ninja (catalogue fr, surcharges, définir surcharge, section de mise en avant) | 4 | OK — catalogue réel renvoyé |
| Redirections (lister, ajouter, retirer) | 3 | OK |
| Prévisualisation avec patch en attente | 1 | OK — le titre en attente apparaît dans le HTML, aucun commit |
| Publication (`publish_status`, `trigger_rebuild`, écriture en mode PR) | 3 | OK — branche `cms/seo-…` créée |
| Nettoyage + validation finale | 2 | OK — contenu de nouveau valide |
| **Total** | **70** | **68 OK + 2 refus attendus** |

Constats utiles intégrés dans les prompts : `seo` d'article **par langue** ; nom réel
de l'outil `create_blog_categorie` ; une modification sans changement de valeur ne
crée pas de commit ; en mode local (dev) le dépôt doit avoir une identité Git
(`user.name`/`user.email`) pour committer.


## 7. Validation


### 4.13 Redirections

> Liste les redirections. Ajoute une 301 de /ancienne-page vers /tours avec la note « page supprimée sept. 2026 ». Retire la redirection /ancienne-page.

*Outils* : `list_redirects`, `add_redirect` (`from`, `to`, `status` 301/302, `note`),
`remove_redirect`. *Piège* : une source déjà existante est refusée.


### 4.5 Plan SEO multilingue

**Prompt**
> Établis un plan SEO pour les pages tours, cruise, custom-tour et contact : pour chaque page et chaque langue (en, fr, es), propose un title de 50–60 caractères et une description de 140–160 caractères cohérents entre eux, en gardant « Amon Tour » et « Krabi ». Présente-les dans un tableau, attends ma validation, puis applique-les page par page.

*Outils* : `seo_audit`, `get_seo`, puis `update_seo` × (pages × langues).
*Résultat attendu* : un commit par page et par langue (12 commits). Demander
« en mode pull request » pour regrouper la relecture sur GitHub.
*Piège* : les URL `/fr/` et `/es/` restent `noindex` ; le plan améliore les
balises servies aux visiteurs des versions FR/ES sans créer de nouvelles URL indexées.
