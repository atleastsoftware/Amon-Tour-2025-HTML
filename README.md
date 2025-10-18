# 🌴 Amon Tour - Template Multi-Agences pour Sites de Voyage

Un template de site web professionnel prêt à l'emploi pour agences de voyage, avec intégration **Tour Ninja** pour la gestion et réservation de tours.

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react&logoColor=black)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=flat&logo=postgresql&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white)

---

## ✨ Fonctionnalités Principales

### 🌐 Site Public
- **Page d'accueil** moderne et responsive
- **Catalogue de tours** avec intégration Tour Ninja en temps réel
- **Demandes de tours personnalisés** avec formulaire intelligent
- **Blog** pour partager actualités et conseils voyage
- **Page de contact** avec WhatsApp, email et formulaire
- **Multilingue** (Anglais, Français, Espagnol) via traduction navigateur
- **SEO optimisé** avec sitemap automatique et meta tags

### 🎨 Éditeur de Pages (Admin)
- **Éditeur visuel** avec blocs personnalisables
- **Système de blocs** : Hero, Texte+Images, Reviews, Galerie, FAQ, etc.
- **Gestion de couleurs** : 2 schémas prédéfinis + personnalisable
- **Styles de design** : Moderne ou Classique
- **Aperçu en temps réel** avant publication

### 📊 Panneau d'Administration
- **Gestion des tours** : CRUD complet pour vos tours personnalisés
- **Tour Ninja** : Affichage automatique des tours depuis votre compte
- **Demandes clients** : Suivi des demandes de tours personnalisés
- **Messages contact** : Gestion centralisée des contacts
- **Newsletter** : Gestion des abonnés
- **Blog** : Publication d'articles avec catégories et tags
- **Pages légales** : Mentions légales, Politique de confidentialité, CGV

### ⚡ Performance
- **Cache intelligent** : Tours Tour Ninja mis en cache (24h serveur, 1h client)
- **Proxy d'images** : Images optimisées sans base64
- **Temps de chargement** : ~200ms pour les tours Tour Ninja
- **Responsive** : Optimisé mobile, tablette et desktop

---

## 🚀 Démarrage Rapide

### Option 1 : Fork sur Replit (Recommandé)

1. **Forker ce Repl** en cliquant sur "Fork" ou "Remix"
2. **Suivre le guide** → Consultez [SETUP.md](./SETUP.md) pour les instructions détaillées
3. **Lancer** → Cliquez sur "Run" et votre site sera accessible !

### Option 2 : Installation Locale

```bash
# Cloner le repository
git clone <votre-url-git>

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env
# Éditez .env avec vos credentials

# Lancer en développement
npm run dev
```

---

## 📋 Configuration Requise

### Obligatoire
- ✅ **Compte Tour Ninja** avec API credentials
- ✅ **Base de données PostgreSQL** (créée automatiquement sur Replit)

### Optionnel
- 📧 **SendGrid** pour l'envoi d'emails
- 💳 **Stripe** pour les paiements en ligne
- 🗄️ **Object Storage** pour les médias (Replit Object Storage ou GCS)

---

## 🔐 Secrets à Configurer

Dans le panneau **Secrets** de Replit :

```bash
# Tour Ninja (Obligatoire)
TOUR_NINJA_API_KEY=votre_api_key
TOUR_NINJA_API_SECRET=votre_api_secret
TOUR_NINJA_PARTNER_ID=votre_partner_id

# Email (Optionnel)
SENDGRID_API_KEY=sg_...
SENDGRID_FROM_EMAIL=noreply@votre-agence.com

# Paiements (Optionnel)
STRIPE_SECRET_KEY=sk_...
STRIPE_PUBLISHABLE_KEY=pk_...
```

---

## 🏗️ Architecture Technique

### Frontend
- **React 18** avec TypeScript
- **Vite** pour build ultra-rapide
- **Tailwind CSS** pour le styling
- **Shadcn/ui** pour les composants UI
- **React Query** pour la gestion du cache
- **Wouter** pour le routing
- **React Hook Form + Zod** pour la validation

### Backend
- **Express.js** avec TypeScript
- **PostgreSQL** avec Drizzle ORM
- **Session-based auth** pour l'admin
- **Rate limiting** et sécurité
- **Multer** pour l'upload de fichiers

### Performance
- **Cache serveur** : 24h pour Tour Ninja
- **Cache client** : 1h avec React Query
- **Image proxy** : Pas de base64, images servies à la demande
- **Async loading** : Pré-chargement des tours au démarrage

---

## 📂 Structure du Projet

```
├── client/               # Application React
│   ├── src/
│   │   ├── pages/       # Pages publiques et admin
│   │   ├── components/  # Composants réutilisables
│   │   ├── hooks/       # Custom React hooks
│   │   └── lib/         # Utilitaires et constantes
│   └── public/          # Assets statiques
├── server/              # API Express
│   ├── routes.ts        # Routes API
│   ├── storage.ts       # Interface base de données
│   ├── tourCache.ts     # Cache Tour Ninja
│   └── index.ts         # Point d'entrée serveur
├── shared/              # Code partagé
│   └── schema.ts        # Schémas Drizzle + Zod
└── SETUP.md             # Guide d'installation détaillé
```

---

## 🎨 Personnalisation

### Changer les Couleurs

Modifiez `client/src/index.css` :

```css
:root {
  --primary: #084F6E;     /* Bleu principal */
  --secondary: #3BA8AF;   /* Turquoise */
}
```

### Modifier les Informations de l'Agence

Éditez `client/src/lib/constants.ts` :

```typescript
export const AGENCY_INFO = {
  name: "Votre Agence",
  email: "contact@votre-agence.com",
  phone: "+XX XX XXX XXXX",
  whatsapp: "+XX XX XXX XXXX",
  address: "Votre adresse"
};
```

### Ajouter votre Logo

Remplacez `client/public/logo.png` et `favicon.ico`

---

## 🔒 Sécurité

### Premier Login Admin

**⚠️ IMPORTANT** : Changez immédiatement le mot de passe par défaut !

- **URL** : `/admin`
- **Username par défaut** : `admin`
- **Password par défaut** : `admin123`

### Bonnes Pratiques

- ✅ Changez les credentials admin au premier lancement
- ✅ Utilisez des secrets Replit pour les API keys (jamais dans le code)
- ✅ Activez HTTPS en production (automatique sur Replit)
- ✅ Configurez le rate limiting (déjà inclus)

---

## 📚 Documentation

- **[SETUP.md](./SETUP.md)** - Guide d'installation complet
- **[replit.md](./replit.md)** - Architecture technique détaillée
- **API Endpoints** - Documentés dans `server/routes.ts`

---

## 🐛 Dépannage

### Les tours Tour Ninja ne s'affichent pas
1. Vérifiez vos secrets Tour Ninja
2. Consultez les logs dans la Console
3. Vérifiez que votre compte a des tours actifs

### Erreur "Port already in use"
1. Stop l'application
2. Attendez 2-3 secondes
3. Relancez avec Run

### Base de données vide
1. L'initialisation est automatique au premier lancement
2. Vérifiez les logs pour les erreurs
3. Redémarrez l'application

---

## 🚀 Déploiement

### Sur Replit (Recommandé)

1. Cliquez sur **"Deploy"**
2. Choisissez votre plan (Autoscale recommandé)
3. Confirmez → Votre site sera en ligne en quelques minutes !
4. URL fournie : `https://votre-nom.replit.app`

### Domaine Personnalisé

1. Dans les settings de déploiement
2. **Domains** → Ajouter votre domaine
3. Configurez vos DNS selon les instructions

---

## 🌟 Fonctionnalités à Venir

- [ ] Multi-currency support
- [ ] Système de réservation en ligne complet
- [ ] Intégration paiements Stripe
- [ ] Tableau de bord analytics
- [ ] App mobile (React Native)

---

## 📝 Licence

Ce projet est un template commercial. Vous êtes libre de l'utiliser pour votre agence.

---

## 🤝 Support

Pour toute question :
- 📖 Consultez [SETUP.md](./SETUP.md)
- 💬 Contactez le support Replit
- 🐛 Vérifiez les logs dans la Console

---

## 🎉 Crédits

- **Template créé par** : Amon Tour Thailand
- **Frameworks** : React, Express, PostgreSQL
- **UI Components** : Shadcn/ui, Tailwind CSS
- **Intégration** : Tour Ninja API

---

**Prêt à lancer votre agence de voyage ? Suivez le guide [SETUP.md](./SETUP.md) ! 🚀**
