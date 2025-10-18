# 🚀 Guide d'Installation - Amon Tour Template

Bienvenue ! Ce guide vous accompagne étape par étape pour configurer votre propre site d'agence de voyage basé sur le template Amon Tour.

## 📋 Prérequis

Avant de commencer, assurez-vous d'avoir :
- ✅ Un compte Replit
- ✅ Un compte Tour Ninja avec vos API credentials
- ✅ (Optionnel) Un compte SendGrid pour les emails
- ✅ (Optionnel) Un compte Stripe pour les paiements

---

## 🔄 Étape 1 : Forker le Projet

1. Cliquez sur le bouton **"Fork"** ou **"Remix"** en haut du Repl
2. Replit créera automatiquement :
   - ✅ Une copie complète du code
   - ✅ Une nouvelle base de données PostgreSQL (dev)
   - ✅ Un nouvel environnement isolé

> ⚠️ **Important** : Votre remix est totalement indépendant. Les modifications que vous faites n'affectent PAS le template original.

---

## 🔐 Étape 2 : Configurer Tour Ninja

### 2.1 Obtenir vos API Credentials

1. Connectez-vous à votre compte **Tour Ninja**
2. Allez dans **Settings → API**
3. Notez vos credentials :
   - `API Key`
   - `API Secret`
   - `Partner ID`

### 2.2 Ajouter les Secrets dans Replit

1. Dans Replit, ouvrez le panneau **Secrets** (icône 🔒 dans la barre latérale)
2. Ajoutez les secrets suivants :

```
TOUR_NINJA_API_KEY=votre_api_key
TOUR_NINJA_API_SECRET=votre_api_secret
TOUR_NINJA_PARTNER_ID=votre_partner_id
```

> 💡 **Astuce** : Les secrets sont sécurisés et ne sont jamais visibles dans le code.

---

## 🎨 Étape 3 : Personnaliser Votre Site

### 3.1 Informations de l'Agence

Modifiez le fichier `client/src/lib/constants.ts` :

```typescript
export const AGENCY_INFO = {
  name: "Votre Agence",
  email: "contact@votre-agence.com",
  phone: "+XX XX XXX XXXX",
  whatsapp: "+XX XX XXX XXXX",
  address: "Votre adresse complète"
};
```

### 3.2 Couleurs du Thème

Modifiez `client/src/index.css` (lignes ~20-30) :

```css
:root {
  --primary: #084F6E;     /* Couleur principale */
  --secondary: #3BA8AF;   /* Couleur secondaire */
  /* Ajustez selon votre charte graphique */
}
```

### 3.3 Logo et Favicon

1. Remplacez les fichiers dans `client/public/` :
   - `logo.png` → Votre logo
   - `favicon.ico` → Votre favicon

---

## 🗄️ Étape 4 : Base de Données

### 4.1 Vérifier la Base de Données de Dev

La base de données de développement est déjà créée automatiquement lors du fork.

Vérifiez dans le panneau **Database** :
- Vous devriez voir une base PostgreSQL active

### 4.2 Initialiser les Données

1. Cliquez sur le bouton **"Run"** pour démarrer l'application
2. Au premier lancement, l'application va :
   - ✅ Créer les tables automatiquement
   - ✅ Initialiser les pages légales par défaut
   - ✅ Pré-charger le cache des tours Tour Ninja

---

## 👤 Étape 5 : Créer votre Compte Admin

### 5.1 Premier Login

1. Une fois l'application démarrée, allez sur : `https://votre-repl.replit.dev/admin`
2. Utilisez les credentials par défaut (À CHANGER IMMÉDIATEMENT) :
   - **Username** : `admin`
   - **Password** : `admin123`

### 5.2 Changer le Mot de Passe Admin

⚠️ **IMPORTANT - SÉCURITÉ** :

1. Connectez-vous avec les credentials par défaut
2. Allez dans **Settings** ou **Profile**
3. Changez immédiatement le mot de passe

> 🔒 Pour plus de sécurité, vous pouvez aussi modifier le code dans `server/index.ts` (lignes ~85-95) pour changer le username et le password par défaut.

---

## ✅ Étape 6 : Tester Votre Site

### 6.1 Vérifier les Pages Publiques

Visitez :
- `/` - Page d'accueil
- `/experiences` - Tours Tour Ninja
- `/custom-tour` - Demande de tour personnalisé
- `/contact` - Page de contact

### 6.2 Vérifier l'Admin

1. Allez sur `/admin`
2. Testez :
   - ✅ Gestion des tours
   - ✅ Demandes de tours personnalisés
   - ✅ Messages de contact
   - ✅ Éditeur de pages

### 6.3 Vérifier Tour Ninja

1. Allez sur `/experiences`
2. Vous devriez voir les tours chargés depuis votre compte Tour Ninja
3. Vérifiez que les images s'affichent correctement

---

## 🚀 Étape 7 : Déployer en Production

### 7.1 Publier sur Replit

1. Cliquez sur **"Deploy"** en haut à droite
2. Suivez l'assistant de publication
3. Choisissez votre plan (Autoscale recommandé pour les sites avec trafic)
4. Confirmez

### 7.2 Base de Données de Production

Lors de la publication, Replit créera automatiquement :
- ✅ Une base de données de production (séparée du dev)
- ✅ Les mêmes tables et structure

### 7.3 Obtenir votre URL

Après publication, vous obtiendrez :
- URL Replit : `https://votre-nom.replit.app`
- Possibilité d'ajouter un domaine personnalisé

---

## 🌐 Étape 8 : Domaine Personnalisé (Optionnel)

1. Dans les settings de déploiement Replit
2. Allez dans **"Domains"**
3. Ajoutez votre domaine personnalisé
4. Suivez les instructions pour configurer les DNS

---

## 📧 Configuration Optionnelle : SendGrid

Pour envoyer des emails (confirmations, notifications) :

### Ajouter les Secrets SendGrid

```
SENDGRID_API_KEY=votre_sendgrid_api_key
SENDGRID_FROM_EMAIL=noreply@votre-agence.com
```

---

## 💳 Configuration Optionnelle : Stripe

Pour accepter les paiements :

### Ajouter les Secrets Stripe

```
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
```

> 💡 Utilisez les clés de test (`sk_test_...`) pendant le développement.

---

## 🛠️ Dépannage

### Problème : Les tours Tour Ninja ne s'affichent pas

**Solutions** :
1. Vérifiez que vos secrets Tour Ninja sont bien configurés
2. Regardez les logs dans la Console (en bas de l'écran)
3. Vérifiez que votre compte Tour Ninja a des tours actifs

### Problème : Erreur "Database connection failed"

**Solutions** :
1. Vérifiez que la base de données est bien créée (panneau Database)
2. Redémarrez l'application (bouton Stop puis Run)

### Problème : "Port already in use"

**Solutions** :
1. Cliquez sur **Stop** pour arrêter l'application
2. Attendez 2-3 secondes
3. Cliquez sur **Run** pour redémarrer

---

## 📚 Ressources Supplémentaires

### Documentation Technique

- `README.md` - Vue d'ensemble du projet
- `replit.md` - Architecture technique détaillée
- Code source dans `client/` et `server/`

### Support

Si vous rencontrez des difficultés :
1. Consultez les logs dans la Console
2. Vérifiez le fichier `replit.md` pour l'architecture
3. Contactez le support Replit si nécessaire

---

## 🎉 Félicitations !

Votre site d'agence de voyage est maintenant opérationnel ! 

### Prochaines Étapes

1. ✅ Personnalisez le contenu de vos pages via l'admin
2. ✅ Ajoutez vos propres tours (si vous ne comptez pas uniquement sur Tour Ninja)
3. ✅ Configurez votre domaine personnalisé
4. ✅ Testez le processus de réservation complet
5. ✅ Lancez votre marketing !

---

## 📝 Checklist Finale Avant Lancement

- [ ] Mot de passe admin changé
- [ ] Informations de l'agence mises à jour
- [ ] Logo et favicon personnalisés
- [ ] Couleurs du thème ajustées
- [ ] Secrets Tour Ninja configurés
- [ ] Tours Tour Ninja s'affichent correctement
- [ ] Pages légales personnalisées (via l'admin)
- [ ] Site testé sur mobile
- [ ] Déploiement en production effectué
- [ ] Domaine personnalisé configuré (optionnel)
- [ ] Emails de test envoyés (si SendGrid configuré)

---

**Bon lancement ! 🚀**
