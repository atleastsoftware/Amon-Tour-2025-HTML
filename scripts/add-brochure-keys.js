#!/usr/bin/env node

/**
 * AJOUTER CLÉS DE LA PAGE BROCHURE
 */

import fs from 'fs';
import path from 'path';

class BrochureKeysAdder {
  constructor() {
    this.localesPath = 'client/public/locales';
    
    // Toutes les clés de la page brochure
    this.brochureKeys = {
      'brochure.seoTitle': {
        en: 'Download Our Travel Brochures | Amon Tour Thailand',
        fr: 'Téléchargez Nos Brochures de Voyage | Amon Tour Thaïlande',
        es: 'Descargar Nuestros Folletos de Viaje | Amon Tour Tailandia'
      },
      'brochure.seoDescription': {
        en: 'Get inspired with our beautifully designed brochure featuring the best experiences Krabi has to offer.',
        fr: 'Inspirez-vous avec notre brochure magnifiquement conçue présentant les meilleures expériences que Krabi a à offrir.',
        es: 'Inspírese con nuestro folleto bellamente diseñado que presenta las mejores experiencias que Krabi tiene para ofrecer.'
      },
      'brochure.seoKeywords': {
        en: 'Amon Tour brochure, Krabi travel guide, Thailand tours PDF, travel brochure download',
        fr: 'Brochure Amon Tour, guide voyage Krabi, tours Thaïlande PDF, téléchargement brochure voyage',
        es: 'Folleto Amon Tour, guía viaje Krabi, tours Tailandia PDF, descarga folleto viaje'
      },
      'brochure.altText': {
        en: 'Amon Tour brochure',
        fr: 'Brochure Amon Tour', 
        es: 'Folleto Amon Tour'
      },
      'brochure.title': {
        en: 'Download Our Brochure',
        fr: 'Téléchargez Notre Brochure',
        es: 'Descargar Nuestro Folleto'
      },
      'brochure.description': {
        en: 'Get inspired with our beautifully designed brochure featuring the best experiences Krabi has to offer.',
        fr: 'Inspirez-vous avec notre brochure magnifiquement conçue présentant les meilleures expériences que Krabi a à offrir.',
        es: 'Inspírese con nuestro folleto bellamente diseñado que presenta las mejores experiencias que Krabi tiene para ofrecer.'
      },
      'brochure.downloadTitle': {
        en: 'Download Our Brochure',
        fr: 'Téléchargez Notre Brochure',
        es: 'Descargar Nuestro Folleto'
      },
      'brochure.downloadDescription': {
        en: 'Get inspired with our beautifully designed brochure featuring the best experiences Krabi has to offer.',
        fr: 'Inspirez-vous avec notre brochure magnifiquement conçue présentant les meilleures expériences que Krabi a à offrir.',
        es: 'Inspírese con nuestro folleto bellamente diseñado que presenta las mejores experiencias que Krabi tiene para ofrecer.'
      },
      'brochure.englishVersion': {
        en: 'English Version',
        fr: 'Version Anglaise',
        es: 'Versión en Inglés'
      },
      'brochure.englishDescription': {
        en: 'Complete guide to our tours and experiences in English, perfect for international travelers.',
        fr: 'Guide complet de nos circuits et expériences en anglais, parfait pour les voyageurs internationaux.',
        es: 'Guía completa de nuestros tours y experiencias en inglés, perfecto para viajeros internacionales.'
      },
      'brochure.downloadEnglish': {
        en: 'Download English PDF',
        fr: 'Télécharger PDF Anglais',
        es: 'Descargar PDF en Inglés'
      },
      'brochure.frenchVersion': {
        en: 'French Version',
        fr: 'Version Française',
        es: 'Versión en Francés'
      },
      'brochure.frenchDescription': {
        en: 'Complete guide to our tours and experiences in French, ideal for French-speaking travelers.',
        fr: 'Guide complet de nos circuits et expériences en français, idéal pour les voyageurs francophones.',
        es: 'Guía completa de nuestros tours y experiencias en francés, ideal para viajeros de habla francesa.'
      },
      'brochure.downloadFrench': {
        en: 'Download French PDF',
        fr: 'Télécharger PDF Français',
        es: 'Descargar PDF en Francés'
      },
      'brochure.whatsInside': {
        en: 'What\'s Inside Our Brochure?',
        fr: 'Que Contient Notre Brochure ?',
        es: '¿Qué Hay Dentro de Nuestro Folleto?'
      },
      'brochure.features.tourPackages': {
        en: '• Featured tour packages',
        fr: '• Forfaits de voyage vedettes',
        es: '• Paquetes turísticos destacados'
      },
      'brochure.features.photography': {
        en: '• Stunning photography',
        fr: '• Photographies époustouflantes',
        es: '• Fotografía impresionante'
      },
      'brochure.features.itineraries': {
        en: '• Detailed itineraries',
        fr: '• Itinéraires détaillés',
        es: '• Itinerarios detallados'
      },
      'brochure.features.pricing': {
        en: '• Pricing information',
        fr: '• Informations sur les prix',
        es: '• Información de precios'
      },
      'brochure.features.contact': {
        en: '• Contact details',
        fr: '• Coordonnées',
        es: '• Detalles de contacto'
      },
      'brochure.features.insights': {
        en: '• Local insights',
        fr: '• Conseils locaux',
        es: '• Perspectivas locales'
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

  // Ajouter les clés brochure à un fichier
  async addBrochureKeysToFile(language) {
    const filePath = path.join(this.localesPath, language, 'common.json');
    
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      const data = JSON.parse(content);
      
      let keysAdded = 0;
      
      // Ajouter chaque clé brochure
      for (const [key, translations] of Object.entries(this.brochureKeys)) {
        if (translations[language]) {
          this.setNestedKey(data, key, translations[language]);
          keysAdded++;
          console.log(`  ✅ Added "${key}"`);
        }
      }
      
      // Sauvegarder
      const updatedContent = JSON.stringify(data, null, 2);
      fs.writeFileSync(filePath, updatedContent, 'utf8');
      console.log(`  📝 Updated ${filePath} with ${keysAdded} brochure keys\n`);
      
    } catch (error) {
      console.error(`❌ Error updating ${language}:`, error.message);
    }
  }

  // Ajouter toutes les clés brochure
  async addAllBrochureKeys() {
    console.log('🔧 AJOUT DES CLÉS DE LA PAGE BROCHURE...\n');
    
    const languages = ['en', 'fr', 'es'];
    
    for (const lang of languages) {
      console.log(`🌐 Processing ${lang.toUpperCase()}...`);
      await this.addBrochureKeysToFile(lang);
    }
    
    console.log('='.repeat(60));
    console.log('🎉 CLÉS BROCHURE AJOUTÉES !');
    console.log('='.repeat(60));
    console.log(`✅ Total brochure keys added: ${Object.keys(this.brochureKeys).length}`);
    console.log('🌐 La page brochure devrait maintenant être entièrement traduite !');
  }
}

// Exécuter l'ajout des clés
const adder = new BrochureKeysAdder();
adder.addAllBrochureKeys().catch(console.error);