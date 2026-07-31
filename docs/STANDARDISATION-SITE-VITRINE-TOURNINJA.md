# Standardisation d'un site vitrine Tour Ninja

Objectif : permettre à n'importe quelle agence de créer un site vitrine connecté
à Tour Ninja via un onboarding simplifié (logo, couleurs, sections, footer),
avec une base HTML simple. Ce document se concentre sur la **connectivité Tour
Ninja** et **où s'affichent les choses**. Le design est géré séparément.

Document de référence complémentaire : `docs/EXPORT-TECHNIQUE-AMON-TOUR.md`
(stack complète du site amon-tour.com).

---

## A. La connectivité Tour Ninja (le cœur, identique pour chaque agence)

Chaque agence a seulement besoin de **2 paramètres** :
- sa **clé vitrine** (format `tourninja-showcase-<companyId>-<nom>`)
- son **companyId**

### A.1 Récupérer le catalogue (la seule route indispensable)
- Appel côté serveur :
  `https://www.tourninja.io/api/public/tours?apiKey=<clé>&companyId=<id>&limit=100&language=<lang>`
- Secours si échec :
  `https://www.tourninja.io/api/public/tours/legacy?companyId=<id>&language=<lang>`
- **Cache de 24 h côté serveur** (évite de surcharger Tour Ninja) ;
  `?fresh=true` pour forcer un rafraîchissement.
- Les tours ne sont **jamais stockés en base** : ils viennent toujours en direct
  de Tour Ninja. Chaque tour fournit : image(s), titre, description, prix
  (THB/EUR/USD), catégories/tags.

### A.2 Afficher les images
- Proxy serveur : `GET /api/tour-image-proxy/<tourId>/<index>`
  → `https://www.tourninja.io/api/tours/images/<tourId>/<index>`
- Header obligatoire : `x-api-key: <clé vitrine>`

### A.3 Réservation et détails (aucun code de réservation à écrire)
- Détails / présentation : `https://www.tourninja.io/details/<tourId>`
- Réservation : `https://www.tourninja.io/book/<tourId>`
- Ces pages s'ouvrent dans une **iframe plein écran** sur le site, avec les
  paramètres `language` / `lang` selon la langue du visiteur.
- C'est ce qui rend le site « vitrine » : catalogue, panier et paiement restent
  100 % chez Tour Ninja.

### A.4 (Optionnel) Renvoi des demandes vers Tour Ninja
- Si le site a un formulaire « tour sur mesure », Tour Ninja vient chercher les
  demandes via `GET /api/sync/tour-ninja` protégé par
  `Authorization: Bearer <clé de sync>`.

---

## B. Où s'affichent les tours sur le site

| Emplacement | Contenu | Au clic |
|---|---|---|
| **Accueil** — section « Nos tours » | Cartes (image, titre, prix « À partir de… », tags) | Iframe détails / réservation |
| **Page /tours** | Grille de tout le catalogue | Boutons Détails / Réserver → iframe |
| **Page /experiences** | Même catalogue filtré par type « expérience » | Iframe |
| **Carte de tour** (composant réutilisé partout) | Carrousel d'images, badge prix, bouton Réserver | Desktop : iframe plein écran · Mobile : iframe dépliée dans la carte |

Comportement du clic (standard à reproduire) :
1. Le visiteur clique sur une carte ou un bouton.
2. Le site ouvre une page interne qui contient une iframe vers
   `tourninja.io/details/<id>` ou `tourninja.io/book/<id>`.
3. Un bouton « Retour » ramène à la page d'origine. La langue du site est
   transmise à l'iframe.

---

## C. Sections standardisables via l'onboarding

Le site actuel gère déjà tout ça en base de données, modifiable depuis l'admin
— c'est la structure à reprendre pour l'onboarding :

1. **Thème / couleurs** : couleur primaire, fond du menu, fond du footer…
   + barre d'annonce (texte, couleur, lien) + popup marketing optionnelle.
2. **Header** : logo (fichier + hauteur), menu de navigation, sélecteur de
   langue.
3. **Footer** (entièrement modifiable) : logo dédié, coordonnées (adresse,
   téléphone, **WhatsApp**, email), liens utiles, réseaux sociaux, inscription
   newsletter, copyright + liens légaux.
4. **Pages / sections activables** : Accueil, Tours, Expériences, Contact,
   (optionnel : Tour sur mesure, Blog).

### Formulaire d'onboarding type (6 champs)
| Champ | Exemple |
|---|---|
| Clé vitrine + companyId | `tourninja-showcase-2-amontour` / `2` |
| Logo | fichier PNG/SVG |
| Couleurs (2-3) | primaire, secondaire, fond footer |
| Coordonnées footer | adresse, téléphone, WhatsApp, email |
| Langues | FR, EN, … |
| Sections à activer | Accueil / Tours / Expériences / Contact |

---

## D. Version « HTML standardisé » recommandée

Pour les futurs sites, pas besoin de React. Le minimum viable :

1. **Un mini-serveur** (Node/Express ou équivalent) avec seulement :
   - le proxy catalogue (A.1) avec cache 24 h
   - le proxy images (A.2)
2. **Des pages HTML** : accueil (hero + grille de tours), tours, expériences,
   contact. Les cartes de tours sont générées à partir du JSON du proxy.
3. **Une page iframe** : `iframe.html?url=...` qui affiche l'iframe Tour Ninja
   plein écran avec un bouton retour.
4. **Un fichier de configuration par agence** (JSON) :
   ```json
   {
     "apiKey": "tourninja-showcase-<id>-<nom>",
     "companyId": 2,
     "logo": "/assets/logo.png",
     "couleurs": { "primaire": "#1e73be", "secondaire": "#E6B64C", "footer": "#0f2c4a" },
     "footer": { "adresse": "...", "telephone": "...", "whatsapp": "...", "email": "..." },
     "langues": ["fr", "en"],
     "sections": ["accueil", "tours", "experiences", "contact"]
   }
   ```
   Les couleurs sont injectées en variables CSS ; le logo et le footer sont
   remplis depuis ce fichier. Créer un nouveau site = dupliquer le modèle +
   remplir ce fichier.

---

## E. Check-list de mise en ligne d'une nouvelle agence

1. Obtenir la clé vitrine + companyId auprès de Tour Ninja.
2. Remplir le fichier de configuration (logo, couleurs, footer, langues, sections).
3. Vérifier que le proxy catalogue renvoie bien les tours de l'agence.
4. Tester un clic Détails et un clic Réserver (iframe, bonne langue).
5. Vérifier le footer (WhatsApp cliquable) et le logo sur mobile + desktop.
6. Publier.
