#!/usr/bin/env node

/**
 * COMPLETION DES CLÉS MANQUANTES - Ajoute toutes les clés de traduction manquantes
 */

import fs from 'fs';
import path from 'path';

class MissingKeysCompleter {
  constructor() {
    this.addedKeys = [];
    this.localesPath = 'client/public/locales';
    
    // Clés manquantes identifiées dans les logs
    this.missingKeys = {
      // Footer
      'footer.contact': {
        en: 'Contact',
        fr: 'Contact',
        es: 'Contacto'
      },
      'footer.usefulLinks': {
        en: 'Useful Links',
        fr: 'Liens Utiles',
        es: 'Enlaces Útiles'
      },
      'footer.defaultNewsletterTitle': {
        en: 'Stay Updated',
        fr: 'Restez Informé',
        es: 'Manténgase Actualizado'
      },
      'footer.defaultNewsletterDescription': {
        en: 'Get the latest news and exclusive offers',
        fr: 'Recevez les dernières nouvelles et offres exclusives',
        es: 'Reciba las últimas noticias y ofertas exclusivas'
      },
      'footer.defaultPrivacyText': {
        en: 'We respect your privacy. Unsubscribe at any time.',
        fr: 'Nous respectons votre vie privée. Désabonnez-vous à tout moment.',
        es: 'Respetamos su privacidad. Cancele la suscripción en cualquier momento.'
      },
      'footer.contactTitles.operationsManager': {
        en: 'Operations manager:',
        fr: 'Responsable des opérations:',
        es: 'Gerente de operaciones:'
      },
      'footer.contactTitles.travelAdvisorManager': {
        en: 'Travel Advisor Manager:',
        fr: 'Responsable des conseillers voyage:',
        es: 'Gerente de asesores de viaje:'
      },
      'footer.countries.thailand': {
        en: 'Thailand',
        fr: 'Thaïlande',
        es: 'Tailandia'
      },
      'footer.links.becomePartner': {
        en: 'Become Partner',
        fr: 'Devenir Partenaire',
        es: 'Convertirse en Socio'
      },
      'footer.links.groupCorporate': {
        en: 'Group & Corporate',
        fr: 'Groupe & Entreprise',
        es: 'Grupo y Corporativo'
      },
      'footer.privacyPolicy': {
        en: 'Privacy Policy',
        fr: 'Politique de Confidentialité',
        es: 'Política de Privacidad'
      },
      'footer.termsConditions': {
        en: 'Terms & Conditions',
        fr: 'Conditions Générales',
        es: 'Términos y Condiciones'
      },
      
      // Hero section
      'hero.seeOffers': {
        en: 'See Offers',
        fr: 'Voir les Offres',
        es: 'Ver Ofertas'
      },
      'hero.customTrip': {
        en: 'Custom Trip',
        fr: 'Voyage Sur Mesure',
        es: 'Viaje Personalizado'
      },
      
      // General
      'Subscribe to newsletter': {
        en: 'Subscribe to newsletter',
        fr: 'S\'abonner à la newsletter',
        es: 'Suscribirse al boletín'
      },
      '🧪 TEST i18next': {
        en: '🧪 TEST i18next',
        fr: '🧪 TEST i18next',
        es: '🧪 TEST i18next'
      },
      '🎯 Nouvelles clés:': {
        en: '🎯 New keys:',
        fr: '🎯 Nouvelles clés:',
        es: '🎯 Nuevas claves:'
      },
      'Contact via WhatsApp': {
        en: 'Contact via WhatsApp',
        fr: 'Contacter via WhatsApp',
        es: 'Contactar vía WhatsApp'
      },
      'Langue:': {
        en: 'Language:',
        fr: 'Langue:',
        es: 'Idioma:'
      },
      'View all reviews on Google': {
        en: 'View all reviews on Google',
        fr: 'Voir tous les avis sur Google',
        es: 'Ver todas las reseñas en Google'
      },
      'Martin Family': {
        en: 'Martin Family',
        fr: 'Famille Martin',
        es: 'Familia Martin'
      },
      'Amon Tour Logo': {
        en: 'Amon Tour Logo',
        fr: 'Logo Amon Tour',
        es: 'Logo Amon Tour'
      },
      'Flame BB Co., Ltd. (Amon Tour).': {
        en: 'Flame BB Co., Ltd. (Amon Tour).',
        fr: 'Flame BB Co., Ltd. (Amon Tour).',
        es: 'Flame BB Co., Ltd. (Amon Tour).'
      }
    };
  }

  // Fonction pour ajouter une clé imbriquée à un objet
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

  // Ajouter les clés manquantes à un fichier de langue
  async addMissingKeysToFile(language) {
    const filePath = path.join(this.localesPath, language, 'common.json');
    
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      const data = JSON.parse(content);
      
      let keysAdded = 0;
      
      // Ajouter chaque clé manquante
      for (const [key, translations] of Object.entries(this.missingKeys)) {
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
        this.addedKeys.push(`${language}: ${keysAdded} keys`);
        console.log(`  📝 Updated ${filePath} with ${keysAdded} new keys`);
      } else {
        console.log(`  ✅ No new keys needed for ${language}`);
      }
      
    } catch (error) {
      console.error(`❌ Error updating ${language}:`, error.message);
    }
  }

  // Compléter toutes les clés manquantes
  async completeAllMissingKeys() {
    console.log('🔧 COMPLETION DES CLÉS DE TRADUCTION MANQUANTES...\n');
    
    const languages = ['en', 'fr', 'es'];
    
    for (const lang of languages) {
      console.log(`🌐 Processing ${lang.toUpperCase()}...`);
      await this.addMissingKeysToFile(lang);
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('🎉 COMPLETION DES CLÉS TERMINÉE !');
    console.log('='.repeat(60));
    console.log(`✅ Total missing keys identified: ${Object.keys(this.missingKeys).length}`);
    console.log(`📝 Files updated: ${this.addedKeys.length}`);
    
    if (this.addedKeys.length > 0) {
      console.log('\n📋 Summary:');
      this.addedKeys.forEach(summary => console.log(`  - ${summary}`));
    }
    
    console.log('\n🚀 TOUTES LES CLÉS MANQUANTES ONT ÉTÉ AJOUTÉES !');
    console.log('🌐 Les traductions devraient maintenant fonctionner correctement !');
  }
}

// Exécuter la completion
const completer = new MissingKeysCompleter();
completer.completeAllMissingKeys().catch(console.error);