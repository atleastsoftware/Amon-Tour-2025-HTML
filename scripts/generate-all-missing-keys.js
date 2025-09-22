#!/usr/bin/env node

/**
 * GÉNÉRATION DE TOUTES LES CLÉS DE TRADUCTION MANQUANTES
 */

import fs from 'fs';
import path from 'path';

class AllMissingKeysGenerator {
  constructor() {
    this.localesPath = 'client/public/locales';
    
    // Toutes les nouvelles clés générées par notre script de correction
    this.newKeys = {
      // Langues
      'languages.english': {
        en: 'English',
        fr: 'Anglais', 
        es: 'Inglés'
      },
      'languages.french': {
        en: 'French',
        fr: 'Français',
        es: 'Francés'
      },
      'languages.spanish': {
        en: 'Spanish', 
        fr: 'Espagnol',
        es: 'Español'
      },
      
      // Navigation
      'navigation.toggleMenu': {
        en: 'Toggle menu',
        fr: 'Basculer le menu',
        es: 'Alternar menú'
      },
      
      // Footer
      'footer.subscribeNewsletter': {
        en: 'Subscribe to newsletter',
        fr: 'S\'abonner à la newsletter',
        es: 'Suscribirse al boletín'
      },
      'footer.contactWhatsApp': {
        en: 'Contact via WhatsApp',
        fr: 'Contacter via WhatsApp',
        es: 'Contactar vía WhatsApp'
      },
      'footer.viewAllReviews': {
        en: 'View all reviews on Google',
        fr: 'Voir tous les avis sur Google',
        es: 'Ver todas las reseñas en Google'
      },
      
      // Pages spécifiques - SEO Titles
      'pages.krabiCelebration.seoTitle': {
        en: 'Krabi Celebration - Amon Tour',
        fr: 'Krabi Celebration - Amon Tour',
        es: 'Krabi Celebration - Amon Tour'
      },
      'pages.villasKrabi.seoTitle': {
        en: 'Villas in Krabi - Luxury Accommodation - Amon Tour',
        fr: 'Villas à Krabi - Hébergement de Luxe - Amon Tour',
        es: 'Villas en Krabi - Alojamiento de Lujo - Amon Tour'
      },
      'pages.becomePartner.seoTitle': {
        en: 'Become Partner - Amon Tour',
        fr: 'Devenir Partenaire - Amon Tour',
        es: 'Convertirse en Socio - Amon Tour'
      },
      'pages.groupCorporate.seoTitle': {
        en: 'Group & Corporate - Amon Tour',
        fr: 'Groupe & Entreprise - Amon Tour',
        es: 'Grupo y Corporativo - Amon Tour'
      },
      'pages.legalNotice.seoTitle': {
        en: 'Legal Notice - Amon Tour',
        fr: 'Mentions Légales - Amon Tour',
        es: 'Aviso Legal - Amon Tour'
      },
      'pages.privacyPolicy.seoTitle': {
        en: 'Privacy Policy - Amon Tour',
        fr: 'Politique de Confidentialité - Amon Tour',
        es: 'Política de Privacidad - Amon Tour'
      },
      'pages.termsConditions.seoTitle': {
        en: 'Terms & Conditions - Amon Tour',
        fr: 'Conditions Générales - Amon Tour',
        es: 'Términos y Condiciones - Amon Tour'
      },
      
      // Titres de pages
      'pages.krabiCelebration.title': {
        en: 'Krabi Celebration',
        fr: 'Krabi Celebration',
        es: 'Krabi Celebration'
      },
      'pages.villasKrabi.title': {
        en: 'Villas in Krabi',
        fr: 'Villas à Krabi',
        es: 'Villas en Krabi'
      },
      'pages.becomePartner.title': {
        en: 'Become Partner',
        fr: 'Devenir Partenaire',
        es: 'Convertirse en Socio'
      },
      'pages.groupCorporate.title': {
        en: 'Group & Corporate',
        fr: 'Groupe & Entreprise',
        es: 'Grupo y Corporativo'
      },
      
      // Pages légales
      'legal.title': {
        en: 'Legal Notice',
        fr: 'Mentions Légales',
        es: 'Aviso Legal'
      },
      'privacy.title': {
        en: 'Privacy Policy',
        fr: 'Politique de Confidentialité',
        es: 'Política de Privacidad'
      },
      'terms.title': {
        en: 'Terms & Conditions',
        fr: 'Conditions Générales', 
        es: 'Términos y Condiciones'
      },
      
      // Entreprise
      'company.fullName': {
        en: 'Flame BB Co., Ltd. (Amon Tour).',
        fr: 'Flame BB Co., Ltd. (Amon Tour).',
        es: 'Flame BB Co., Ltd. (Amon Tour).'
      },
      
      // Logos et images
      'common.amonLogo': {
        en: 'Amon Logo',
        fr: 'Logo Amon',
        es: 'Logo Amon'
      },
      'common.amonTourLogo': {
        en: 'Amon Tour Logo',
        fr: 'Logo Amon Tour',
        es: 'Logo Amon Tour'
      },
      
      // Clés communes générées automatiquement
      'common.didyouforgettoaddth': {
        en: 'Did you forget to add the page to the router?',
        fr: 'Avez-vous oublié d\'ajouter la page au routeur ?',
        es: '¿Olvidaste agregar la página al enrutador?'
      },
      'common.amontourexperiencean': {
        en: 'Amon Tour Experience and Krabi Stays',
        fr: 'Expérience Amon Tour et Séjours Krabi',
        es: 'Experiencia Amon Tour y Estancias Krabi'
      },
      'common.authenticthailandexp': {
        en: 'Authentic Thailand experiences with local family',
        fr: 'Expériences authentiques de Thaïlande avec famille locale',
        es: 'Experiencias auténticas de Tailandia con familia local'
      },
      'common.discoverkrabiandsou': {
        en: 'Discover Krabi and southern Thailand like never before',
        fr: 'Découvrez Krabi et le sud de la Thaïlande comme jamais auparavant',
        es: 'Descubre Krabi y el sur de Tailandia como nunca antes'
      }
    };
  }

  // Fonction pour ajouter une clé imbriquée
  setNestedKey(obj, keyPath, value) {
    const keys = keyPath.split('.');
    let current = obj;
    
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!(key in current)) {
        current[key] = {};
      }
      current = current[key];
    }
    
    current[keys[keys.length - 1]] = value;
  }

  // Ajouter toutes les nouvelles clés à un fichier de langue
  async addAllKeysToFile(language) {
    const filePath = path.join(this.localesPath, language, 'common.json');
    
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      const data = JSON.parse(content);
      
      let keysAdded = 0;
      
      // Ajouter chaque nouvelle clé
      for (const [key, translations] of Object.entries(this.newKeys)) {
        if (translations[language]) {
          // Vérifier si la clé existe déjà
          const keys = key.split('.');
          let current = data;
          let exists = true;
          
          for (const k of keys) {
            if (!(k in current)) {
              exists = false;
              break;
            }
            current = current[k];
          }
          
          if (!exists) {
            this.setNestedKey(data, key, translations[language]);
            keysAdded++;
            console.log(`  ✅ Added "${key}": "${translations[language]}"`);
          }
        }
      }
      
      // Sauvegarder le fichier mis à jour
      if (keysAdded > 0) {
        const updatedContent = JSON.stringify(data, null, 2);
        fs.writeFileSync(filePath, updatedContent, 'utf8');
        console.log(`  📝 Updated ${filePath} with ${keysAdded} new keys\n`);
      } else {
        console.log(`  ✅ All keys already exist for ${language}\n`);
      }
      
    } catch (error) {
      console.error(`❌ Error updating ${language}:`, error.message);
    }
  }

  // Générer toutes les clés manquantes
  async generateAllMissingKeys() {
    console.log('🔧 GÉNÉRATION DE TOUTES LES CLÉS DE TRADUCTION MANQUANTES...\n');
    
    const languages = ['en', 'fr', 'es'];
    
    for (const lang of languages) {
      console.log(`🌐 Processing ${lang.toUpperCase()}...`);
      await this.addAllKeysToFile(lang);
    }
    
    console.log('='.repeat(60));
    console.log('🎉 GÉNÉRATION TERMINÉE !');
    console.log('='.repeat(60));
    console.log(`✅ Total new keys defined: ${Object.keys(this.newKeys).length}`);
    console.log(`🌐 Languages updated: ${languages.length}`);
    
    console.log('\n🚀 TOUTES LES CLÉS MANQUANTES ONT ÉTÉ AJOUTÉES !');
    console.log('🌐 Le système de traduction devrait maintenant être 100% fonctionnel !');
  }
}

// Exécuter la génération
const generator = new AllMissingKeysGenerator();
generator.generateAllMissingKeys().catch(console.error);