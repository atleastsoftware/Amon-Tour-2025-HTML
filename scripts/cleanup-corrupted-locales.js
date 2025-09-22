#!/usr/bin/env node

/**
 * Script de nettoyage pour réparer les fichiers de traduction corrompus
 * Garde seulement les clés valides présentes dans en/common.json
 */

import fs from 'fs';
import path from 'path';

function cleanupLocales() {
  try {
    // Lire le fichier de référence anglais
    const enPath = 'client/public/locales/en/common.json';
    const enContent = fs.readFileSync(enPath, 'utf8');
    const enData = JSON.parse(enContent);
    const validKeys = new Set(Object.keys(enData));
    
    console.log(`📖 Found ${validKeys.size} valid keys in en/common.json`);
    
    // Nettoyer les fichiers français et espagnols
    const locales = ['fr', 'es'];
    
    for (const locale of locales) {
      const localePath = `client/public/locales/${locale}/common.json`;
      console.log(`\n🧹 Cleaning ${localePath}...`);
      
      try {
        const localeContent = fs.readFileSync(localePath, 'utf8');
        const localeData = JSON.parse(localeContent);
        
        // Créer un nouveau objet avec seulement les clés valides
        const cleanedData = {};
        let removedCount = 0;
        let keptCount = 0;
        
        for (const [key, value] of Object.entries(localeData)) {
          if (validKeys.has(key)) {
            cleanedData[key] = value;
            keptCount++;
          } else {
            console.log(`  ❌ Removing invalid key: "${key}"`);
            removedCount++;
          }
        }
        
        // Ajouter les clés manquantes avec les valeurs anglaises temporaires
        let addedCount = 0;
        for (const key of validKeys) {
          if (!cleanedData.hasOwnProperty(key)) {
            cleanedData[key] = enData[key]; // Valeur temporaire en anglais
            addedCount++;
            console.log(`  ➕ Added missing key: "${key}"`);
          }
        }
        
        // Sauvegarder le fichier nettoyé
        fs.writeFileSync(localePath, JSON.stringify(cleanedData, null, 2), 'utf8');
        
        console.log(`  ✅ Cleaned ${localePath}:`);
        console.log(`     - Kept: ${keptCount} keys`);
        console.log(`     - Removed: ${removedCount} corrupted keys`);
        console.log(`     - Added: ${addedCount} missing keys`);
        
      } catch (error) {
        console.error(`  ❌ Error processing ${localePath}:`, error.message);
      }
    }
    
    console.log('\n🎉 Locale cleanup completed successfully!');
    
  } catch (error) {
    console.error('❌ Fatal error during cleanup:', error.message);
    process.exit(1);
  }
}

cleanupLocales();