/**
 * Populate SEO Content Script
 * Creates comprehensive French SEO content for Krabi tourism
 */

import pkg from 'pg';
const { Pool } = pkg;
import { seoArticles, seoCategories, seoTags } from './seo-content-generator.js';

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function createSlug(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Remove multiple hyphens
    .trim();
}

async function populateCategories() {
  console.log('📁 Creating blog categories...');
  
  const createdCategories = new Map();
  
  for (const category of seoCategories) {
    try {
      const result = await pool.query(`
        INSERT INTO blog_categories (name, slug, description)
        VALUES ($1, $2, $3)
        ON CONFLICT (slug) DO UPDATE SET 
          name = EXCLUDED.name,
          description = EXCLUDED.description,
          updated_at = NOW()
        RETURNING id, name, slug
      `, [category.name, category.slug, category.description]);
      
      createdCategories.set(category.name, result.rows[0]);
      console.log(`✅ Category created/updated: ${result.rows[0].name}`);
    } catch (error) {
      console.error(`❌ Error creating category ${category.name}:`, error.message);
    }
  }
  
  return createdCategories;
}

async function populateTags() {
  console.log('🏷️ Creating blog tags...');
  
  const createdTags = new Map();
  
  for (const tagName of seoTags) {
    const slug = await createSlug(tagName);
    
    try {
      const result = await pool.query(`
        INSERT INTO blog_tags (name, slug)
        VALUES ($1, $2)
        ON CONFLICT (slug) DO UPDATE SET 
          name = EXCLUDED.name
        RETURNING id, name, slug
      `, [tagName, slug]);
      
      createdTags.set(tagName, result.rows[0]);
    } catch (error) {
      console.error(`❌ Error creating tag ${tagName}:`, error.message);
    }
  }
  
  console.log(`✅ ${createdTags.size} tags created/updated`);
  return createdTags;
}

async function populateArticles(categories, tags) {
  console.log('📝 Creating SEO blog articles...');
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const article of seoArticles) {
    try {
      // Get category ID
      const category = categories.get(article.category);
      const categoryId = category ? category.id : null;
      
      // Create blog post
      const postResult = await pool.query(`
        INSERT INTO blog_posts (
          title, slug, excerpt, content, cover_image, 
          category_id, status, publish_date, author_name
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), $8)
        ON CONFLICT (slug) DO UPDATE SET
          title = EXCLUDED.title,
          excerpt = EXCLUDED.excerpt,
          content = EXCLUDED.content,
          category_id = EXCLUDED.category_id,
          updated_at = NOW()
        RETURNING id, title, slug
      `, [
        article.title,
        article.slug,
        article.excerpt,
        article.content,
        null, // Will add cover images later
        categoryId,
        'published',
        'Amon Tour'
      ]);
      
      const postId = postResult.rows[0].id;
      
      // Add tags to post
      for (const tagName of article.tags) {
        const tag = tags.get(tagName);
        if (tag) {
          await pool.query(`
            INSERT INTO blog_post_tags (post_id, tag_id)
            VALUES ($1, $2)
            ON CONFLICT (post_id, tag_id) DO NOTHING
          `, [postId, tag.id]);
        }
      }
      
      successCount++;
      console.log(`✅ Article created: ${postResult.rows[0].title}`);
      
    } catch (error) {
      errorCount++;
      console.error(`❌ Error creating article "${article.title}":`, error.message);
    }
  }
  
  console.log(`\n📊 Articles Summary:`);
  console.log(`✅ Successfully created: ${successCount}`);
  console.log(`❌ Errors: ${errorCount}`);
}

async function addSEOMetadata() {
  console.log('🔍 Adding SEO metadata to existing articles...');
  
  // Update articles with SEO keywords and structured data
  try {
    await pool.query(`
      UPDATE blog_posts 
      SET content = content || '

<!-- SEO Structured Data -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "' || title || '",
  "description": "' || excerpt || '",
  "author": {
    "@type": "Organization",
    "name": "Amon Tour",
    "url": "https://www.amon-tour.com"
  },
  "publisher": {
    "@type": "Organization",
    "name": "Amon Tour",
    "logo": {
      "@type": "ImageObject",
      "url": "https://www.amon-tour.com/logo.png"
    }
  },
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "https://www.amon-tour.com/blog/' || slug || '"
  },
  "datePublished": "' || publish_date::text || '",
  "dateModified": "' || updated_at::text || '"
}
</script>'
      WHERE status = 'published'
    `);
    
    console.log('✅ SEO metadata added to all published articles');
  } catch (error) {
    console.error('❌ Error adding SEO metadata:', error.message);
  }
}

async function createAdditionalSEOArticles() {
  console.log('📝 Creating additional SEO articles...');
  
  const additionalArticles = [
    {
      title: "Budget Voyage Krabi 2025 : Guide Complet des Prix et Bons Plans",
      slug: "budget-voyage-krabi-2025-guide-prix-bons-plans",
      excerpt: "Combien coûte un voyage à Krabi ? Guide détaillé des prix : hébergements, restaurants, transports, excursions et astuces pour économiser.",
      category: "Conseils Voyage",
      tags: ["Budget Krabi", "Conseils voyage", "Prix Thaïlande", "Économies voyage", "Planification"],
      content: `# Budget Voyage Krabi 2025 : Tout Savoir sur les Prix et Comment Économiser

Planifier le budget de votre voyage à Krabi peut sembler complexe. Voici notre guide détaillé avec tous les prix actualisés et nos meilleurs conseils pour optimiser vos dépenses.

## Budget Moyen par Jour (2 personnes)

### Budget Routard (1,500-2,500 THB/jour)
**Hébergement :** 600-1,000 THB
- Auberges de jeunesse dortoir partagé
- Guesthouses simples
- Bungalows basiques

**Repas :** 400-800 THB  
- Street food et marchés locaux
- Restaurants locaux authentiques
- Pad Thaï : 60-120 THB
- Plats fruits de mer : 150-300 THB

**Transport :** 200-400 THB
- Songthaews (transport local)
- Location scooter
- Bateaux partagés vers îles

**Activités :** 300-800 THB
- Excursions groupes budget
- Entrées sites gratuits/temples
- Location matériel snorkeling

### Budget Confort (3,000-5,000 THB/jour)
**Hébergement :** 1,500-2,500 THB
- Hôtels 3 étoiles
- Bungalows climatisés avec piscine
- Resorts milieu de gamme

**Repas :** 800-1,500 THB
- Restaurants touristiques de qualité  
- Mélange cuisine locale et internationale
- Déjeuner restaurant : 300-500 THB
- Dîner avec vue : 600-1,000 THB

**Transport :** 400-800 THB
- Taxis climatisés
- Bateaux rapides
- Tours organisés avec transferts

**Activités :** 800-1,200 THB  
- Excursions standard
- Massages spa
- Cours de cuisine

### Budget Luxe (8,000+ THB/jour)
**Hébergement :** 4,000-12,000+ THB
- Resorts 4-5 étoiles
- Villas privées avec piscine
- Suites vue mer

**Repas :** 2,000-4,000+ THB
- Restaurants gastronomiques
- Room service haut de gamme
- Expériences culinaires privées

**Transport :** 1,000-3,000+ THB
- Voitures avec chauffeur privé
- Bateaux speedboat privés
- Transferts hélicoptère

**Activités :** 3,000-8,000+ THB
- Tours privés sur-mesure
- Spa treatments de luxe  
- Expériences exclusives

## Prix Détaillés par Catégorie

### Hébergements (Prix par nuit, 2 personnes)
**Auberges/Hostels :**
- Dortoir partagé : 300-600 THB
- Chambre privée simple : 600-1,200 THB

**Guesthouses/Budget Hotels :**
- Chambre standard AC : 800-1,500 THB  
- Bungalow jardin : 1,000-2,000 THB

**Hôtels Milieu de Gamme :**
- Hôtel 3* centre : 1,500-3,000 THB
- Resort 3* piscine : 2,000-4,000 THB

**Hôtels de Luxe :**
- Resort 4* beachfront : 4,000-8,000 THB
- Villa privée luxe : 8,000-20,000+ THB

### Restauration (Prix par personne)
**Street Food & Locaux :**
- Pad Thaï street : 50-80 THB
- Som Tam (salade papaye) : 60-100 THB  
- Riz sauté : 70-120 THB
- Nouilles soupe : 60-150 THB
- Fruits frais : 30-80 THB
- Coconut shake : 50-100 THB

**Restaurants Touristiques :**
- Plats thaïs standards : 150-300 THB
- Fruits de mer grillés : 300-600 THB
- Plats internationaux : 250-500 THB  
- Bières locales : 80-150 THB
- Cocktails : 200-400 THB

**Restaurants Haut de Gamme :**
- Menu gastronomique : 800-1,500+ THB
- Homard grillé : 800-1,200 THB
- Vins importés : 1,500-5,000+ THB bouteille

### Transports
**Local (Krabi) :**
- Songthaew : 50-80 THB
- Tuk-tuk course courte : 100-200 THB
- Taxi Ao Nang-Krabi Town : 400-600 THB

**Location Véhicules (par jour) :**
- Scooter 125cc : 200-300 THB
- Moto 250cc : 400-600 THB  
- Voiture économique : 1,200-1,800 THB
- SUV/minivan : 2,000-3,500 THB

**Bateaux vers Îles :**
- Long-tail partagé : 100-200 THB
- Speedboat groupe : 1,500-2,500 THB
- Bateau privé journée : 6,000-15,000 THB

### Excursions et Activités
**Tours Populaires :**
- 4 Islands Tour : 1,200-1,800 THB
- Phi Phi Islands : 1,800-2,500 THB  
- Hong Island : 1,500-2,000 THB
- James Bond Island : 1,600-2,200 THB
- Emerald Pool + Hot Springs : 1,400-1,800 THB

**Activités :**
- Massage thaï (1h) : 300-600 THB
- Cours cuisine : 1,500-2,500 THB
- Plongée bouteille (2 plongées) : 2,800-3,500 THB
- Cours escalade : 1,200-1,800 THB

## Conseils pour Économiser

### Hébergements Moins Chers
✅ **Réservez à l'avance** (saison haute)
✅ **Négociez sur place** (saison creuse)  
✅ **Choisissez légèrement excentré** (5-10 min du centre)
✅ **Séjours longs** = tarifs dégressifs
✅ **Évitez vue mer directe** = 30-50% d'économie

### Alimentation Budget
✅ **Street food et marchés locaux**
✅ **Restaurants fréquentés par thaïs**
✅ **Évitez zones ultra-touristiques**
✅ **Fruits tropicaux** (moins chers que desserts restaurants)
✅ **Boire eau en bouteille** vs cocktails

### Transport Économique  
✅ **Songthaews** vs taxis privés
✅ **Location scooter** pour flexibilité  
✅ **Marche à pied** quand possible
✅ **Tours groupés** vs excursions privées
✅ **Négociez prix long-tail boats**

### Activités Gratuites/Pas Chères
✅ **Plages publiques gratuites**
✅ **Temples** (donation volontaire)
✅ **Randonnées nature** (Tiger Cave Temple)
✅ **Couchers de soleil** depuis plages
✅ **Marchés nocturnes** (animation gratuite)

## Variations Saisonnières des Prix

### Haute Saison (Dec-Mar)
- Hébergements : +50-100% 
- Excursions : Prix standards
- Restaurants : Pas de variation
- Vols internationaux : +30-60%

### Saison Intermédiaire (Apr-Mai, Oct-Nov)  
- Hébergements : Prix normaux
- Tours : Parfois promotions
- Moins de foule = négociation possible

### Basse Saison (Jun-Sep)
- Hébergements : -30-50%
- Excursions : Promotions fréquentes
- Risque annulations météo
- Vols moins chers

## Budget Par Type de Séjour

### Lune de Miel Romantique (7 jours)
**Budget confortable :** 45,000-65,000 THB
- Resort 4* vue mer : 35,000 THB
- Restaurants romantiques : 8,000 THB
- Excursions privées : 12,000 THB  
- Spa couples : 4,000 THB
- Transports : 6,000 THB

### Famille 2 Adultes + 2 Enfants (10 jours)
**Budget moyen :** 60,000-85,000 THB
- Hébergement familial : 35,000 THB
- Repas (enfants 50% prix) : 20,000 THB  
- Excursions familiales : 15,000 THB
- Transports : 8,000 THB
- Activités enfants : 7,000 THB

### Backpackers Groupe d'Amis (14 jours)  
**Budget serré :** 25,000-35,000 THB par personne
- Auberges/guesthouses : 12,000 THB
- Street food majorité : 8,000 THB
- Excursions groupes : 8,000 THB
- Transports locaux : 3,000 THB  
- Vie nocturne : 4,000 THB

## Erreurs Budget à Éviter

❌ **Sous-estimer coûts excursions** (30-40% budget total)
❌ **Oublier pourboires** (10-15% restaurants)
❌ **Négliger assurance voyage** (risque coûts médicaux)
❌ **Changer argent aéroport** (taux défavorables)  
❌ **Payer uniquement carte** (frais bancaires)
❌ **Réserver dernière minute haute saison**

## Applications et Outils Utiles

### Gestion Budget
- **Trail Wallet** : Suivi dépenses voyage  
- **XE Currency** : Convertisseur monnaie
- **Splitwise** : Partage frais entre amis

### Bons Plans Hébergements  
- **Agoda** : Spécialiste Asie, bons prix
- **Booking.com** : Large sélection
- **Hostelworld** : Auberges de jeunesse

*Amon Tour vous aide à optimiser votre budget avec nos forfaits sur-mesure et conseils d'experts locaux. Contactez-nous pour un devis personnalisé selon vos envies et votre budget.*`
    },
    
    {
      title: "Quand Partir à Krabi : Guide Météo et Saisons pour Choisir la Meilleure Période",
      slug: "quand-partir-krabi-guide-meteo-saisons-meilleure-periode",
      excerpt: "Découvrez quand partir à Krabi selon la météo, l'affluence et les prix. Guide complet des saisons avec températures, précipitations et conseils mois par mois.",
      category: "Conseils Voyage", 
      tags: ["Météo Krabi", "Quand partir", "Saisons Thaïlande", "Climat Krabi", "Planification voyage"],
      content: `# Quand Partir à Krabi : Le Guide Complet des Saisons pour un Voyage Réussi

Choisir la bonne période pour visiter Krabi peut transformer votre voyage. Voici notre guide météo complet avec toutes les informations pour planifier vos dates idéales.

## Vue d'Ensemble : Les 3 Saisons de Krabi

### Saison Sèche (Novembre - Mars) ⭐⭐⭐⭐⭐
**Pourquoi c'est la meilleure période :**
- Temps ensoleillé quasi permanent
- Précipitations minimales (2-5 jours/mois)
- Mer calme, idéale pour excursions
- Visibilité parfaite pour snorkeling/plongée

**Inconvénients :**
- Prix élevés (haute saison touristique)
- Affluence maximale sur sites populaires
- Réservations nécessaires à l'avance

### Saison Intermédiaire (Avril-Mai, Octobre) ⭐⭐⭐⭐
**Les mois du compromis parfait :**
- Météo généralement favorable
- Moins de foule qu'en haute saison
- Prix plus raisonnables  
- Bonne disponibilité hébergements

**À surveiller :**
- Possibles averses courtes
- Chaleur plus intense (avril-mai)
- Début/fin mousson à prévoir

### Saison des Pluies (Juin - Septembre) ⭐⭐⭐
**Pour les voyageurs flexibles :**
- Prix bas (jusqu'à -50%)
- Paysages verts et luxuriants
- Moins de touristes
- Expérience plus authentique

**Défis :**
- Pluies quotidiennes possibles
- Mer parfois agitée
- Certaines excursions annulées

## Guide Mois par Mois Détaillé

### NOVEMBRE ⭐⭐⭐⭐⭐
**Conditions météo :**
- Température : 26-32°C
- Précipitations : 3-4 jours dans le mois
- Humidité : 75% (supportable)
- Mer : Calme et claire

**Pourquoi c'est idéal :**
- Fin de la mousson, début saison sèche
- Végétation encore verte des pluies
- Moins cher qu'en décembre-janvier
- Conditions parfaites pour toutes activités

**Conseils :**
- Réservez tôt pour meilleurs prix
- Début de haute saison
- Parfait pour lune de miel

### DÉCEMBRE ⭐⭐⭐⭐⭐  
**Peak season commence :**
- Température : 25-30°C (idéale)
- Précipitations : 1-2 jours maximum
- Soleil : 8-9h/jour garanti
- Mer : Conditions parfaites

**Spécificités :**
- Noël/Nouvel An = prix très élevés
- Réservations indispensables
- Animation maximale
- Conditions photographiques parfaites

**À prévoir :**
- Budget +50-100% vs autres mois
- Foule sur sites populaires
- Atmosphère festive unique

### JANVIER ⭐⭐⭐⭐⭐
**Le mois le plus populaire :**
- Température : 24-30°C (parfaite)
- Précipitations : Quasi nulles
- Brise marine rafraîchissante
- Visibilité sous-marine maximale

**Avantages :**
- Conditions météo optimales
- Toutes excursions opérationnelles  
- Mer d'huile pour îles
- Couchers de soleil spectaculaires

**Inconvénients :**
- Prix haute saison maintenus
- Sites très fréquentés
- Réservations 2-3 mois à l'avance

### FÉVRIER ⭐⭐⭐⭐⭐
**L'équilibre parfait :**
- Température : 25-31°C
- Précipitations : Rares (1-2 jours)
- Humidité : La plus basse de l'année
- Vent : Léger, rafraîchissant

**Points forts :**  
- Climat le plus confortable
- Moins de foule qu'en janvier
- Prix commencent à baisser fin février
- Idéal familles avec enfants

### MARS ⭐⭐⭐⭐
**Fin de saison sèche :**
- Température : 26-33°C
- Précipitations : Faibles mais possibles
- Soleil : Très présent
- Chaleur : Commence à augmenter

**Caractéristiques :**
- Dernières semaines optimales
- Prix encore élevés début mars
- Chaleur plus intense l'après-midi
- Parfait pour activités matinales

### AVRIL ⭐⭐⭐
**Transition vers saison chaude :**
- Température : 27-35°C
- Précipitations : Augmentation progressive
- Humidité : En hausse
- Orages : Possibles en soirée

**Pour qui :**
- Voyageurs supportant chaleur
- Budget plus serré  
- Moins de foule
- Prix intermédiaires

**Conseils :**
- Activités tôt matin/fin après-midi
- Hydratation constante nécessaire
- Climatisation indispensable

### MAI ⭐⭐⭐
**Pré-mousson :**
- Température : 28-34°C
- Précipitations : 10-15 jours
- Humidité : Élevée (85%+)
- Orages : Fréquents après-midi

**Avantages :**
- Prix bas commencent
- Paysages verdoyants
- Moins de touristes
- Averses rafraîchissantes

**Inconvénients :**
- Chaleur étouffante
- Orages perturbent planning
- Certains hôtels ferment

### JUIN - JUILLET - AOÛT ⭐⭐
**Cœur de mousson :**
- Température : 27-32°C
- Précipitations : 15-20 jours/mois
- Pluies : Intenses mais courtes généralement
- Mer : Parfois agitée

**Réalité mousson :**
- PAS de pluie continue 24h/24
- Souvent pluies 1-3h puis soleil
- Matinées souvent sèches
- Activités intérieures alternatives

**Avantages :**
- Prix très bas (-40 à -60%)
- Krabi authentique, moins commercial
- Végétation luxuriante
- Cascades au maximum

### SEPTEMBRE ⭐⭐
**Fin de mousson :**
- Température : 27-32°C  
- Précipitations : Peak de la mousson
- Pluies : Plus longues et fréquentes
- Mer : Souvent agitée

**Mois le plus pluvieux :**
- 20+ jours de pluie possibles
- Certaines excursions annulées
- Prix au plus bas
- Expérience locale authentique

### OCTOBRE ⭐⭐⭐⭐
**Transition post-mousson :**
- Température : 26-32°C
- Précipitations : En diminution
- Soleil : Retour progressif
- Prix : Encore avantageux

**Excellent compromis :**
- Fin mousson, conditions s'améliorent
- Prix pas encore remontés  
- Moins de foule
- Nature au maximum de beauté

## Activités Selon les Saisons

### Saison Sèche (Nov-Mar) - Toutes Activités
✅ **Excursions îles** : Conditions parfaites
✅ **Snorkeling/Plongée** : Visibilité maximale  
✅ **Escalade** : Rochers secs, grip optimal
✅ **Kayak** : Mer calme idéale
✅ **Randonnées** : Pas de boue, chaleur supportable
✅ **Photographie** : Lumière parfaite

### Saison Intermédiaire (Apr-Mai, Oct) - Adaptation
✅ **Excursions matinales** : Avant chaleur/orages
✅ **Activités indoor** : Spa, cuisine, shopping  
✅ **Cascades** : Plus spectaculaires
⚠️ **Flexible planning** : Backup activités pluie

### Saison Pluies (Jun-Sep) - Sélectif  
✅ **Spa et wellness** : Prix bas, moins monde
✅ **Culture locale** : Temples, marchés, artisanat
✅ **Cours cuisine** : Activité indoor fun
⚠️ **Excursions îles** : Dépendant météo quotidienne
❌ **Escalade outdoor** : Rochers glissants

## Conseils par Type de Voyage

### Lune de Miel / Voyage Romantique
**Meilleure période :** Décembre - Février
- Couchers soleil garantis
- Dîners romantiques outdoor  
- Excursions privées possibles
- Photos parfaites

### Famille avec Enfants
**Recommandé :** Novembre, Février, Mars
- Météo stable et prévisible
- Activités extérieures sûres
- Pas de pluie perturbant planning
- Mer calme pour baignade

### Voyage Budget / Backpackers  
**Idéal :** Mai, Octobre, Juin
- Prix hébergements très bas
- Expérience locale authentique
- Moins de foule touristique
- Accepter aléas météo

### Voyage Aventure (Escalade, Plongée)
**Optimal :** Décembre - Mars
- Conditions techniques parfaites
- Visibilité sous-marine max
- Rochers secs pour escalade
- Sécurité maximale

## Que Prévoir Selon la Saison

### Saison Sèche
👕 **Vêtements :** Légers, protection solaire
🕶️ **Accessoires :** Lunettes, chapeau, crème SPF50+
🌡️ **Préparation :** Hydratation, planning flexible chaleur

### Saison Pluies  
☔ **Imperméables :** Poncho, sac étanche
👟 **Chaussures :** Antidérapantes, séchage rapide
🏨 **Hébergement :** Vérifier évacuation eau, AC fonctionnel

## Événements et Festivals

### Décembre - Janvier
- **Nouvel An Thaï** (31 déc-1er jan)
- **Loy Krathong** (novembre/décembre selon calendrier lunaire)

### Février - Mars  
- **Chinese New Year** : Célébrations communauté chinoise
- **Makha Bucha** : Fête bouddhiste importante

### Avril
- **Songkran** (13-15 avril) : Nouvel An Thaï traditionnel, bataille d'eau nationale

*Contactez Amon Tour pour des conseils personnalisés selon vos dates et vos priorités. Nos experts locaux vous aident à choisir la période parfaite pour VOS envies de voyage.*`
    }
  ];
  
  // Process additional articles
  const categories = await populateCategories();
  const tags = await populateTags();
  
  for (const article of additionalArticles) {
    try {
      const category = categories.get(article.category);
      const categoryId = category ? category.id : null;
      
      const postResult = await pool.query(`
        INSERT INTO blog_posts (
          title, slug, excerpt, content, category_id, status, publish_date, author_name
        )
        VALUES ($1, $2, $3, $4, $5, $6, NOW(), $7)
        ON CONFLICT (slug) DO UPDATE SET
          title = EXCLUDED.title,
          excerpt = EXCLUDED.excerpt,
          content = EXCLUDED.content,
          updated_at = NOW()
        RETURNING id, title
      `, [
        article.title,
        article.slug,
        article.excerpt,
        article.content,
        categoryId,
        'published',
        'Amon Tour'
      ]);
      
      const postId = postResult.rows[0].id;
      
      // Add tags
      for (const tagName of article.tags) {
        const tag = tags.get(tagName);
        if (tag) {
          await pool.query(`
            INSERT INTO blog_post_tags (post_id, tag_id)
            VALUES ($1, $2)
            ON CONFLICT (post_id, tag_id) DO NOTHING
          `, [postId, tag.id]);
        }
      }
      
      console.log(`✅ Additional article created: ${postResult.rows[0].title}`);
    } catch (error) {
      console.error(`❌ Error creating additional article:`, error.message);
    }
  }
}

async function main() {
  try {
    console.log('🚀 Starting SEO content population for Krabi French tourism...\n');
    
    // Step 1: Create categories
    const categories = await populateCategories();
    
    // Step 2: Create tags  
    const tags = await populateTags();
    
    // Step 3: Create main articles
    await populateArticles(categories, tags);
    
    // Step 4: Add additional articles
    await createAdditionalSEOArticles();
    
    // Step 5: Add SEO metadata
    await addSEOMetadata();
    
    console.log('\n🎉 SEO content population completed successfully!');
    console.log('📈 Your Krabi tourism site is now optimized for French-speaking travelers');
    
  } catch (error) {
    console.error('💥 Fatal error in SEO content population:', error);
  } finally {
    await pool.end();
  }
}

// Run if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { main };