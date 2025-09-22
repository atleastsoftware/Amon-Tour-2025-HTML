#!/usr/bin/env node

/**
 * NETTOYAGE RAPIDE - Supprime tous les hooks useTranslation dupliqués
 */

import fs from 'fs';
import path from 'path';

class DuplicateHookCleaner {
  constructor() {
    this.cleanedFiles = [];
  }

  // Nettoyer un fichier des hooks dupliqués
  cleanFile(filePath) {
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      const relativePath = path.relative(process.cwd(), filePath);
      
      // Vérifier s'il y a des hooks dupliqués
      const hasMultipleHooks = (content.match(/const.*\{.*t.*\}.*=.*useTranslation/g) || []).length > 1;
      
      if (!hasMultipleHooks) {
        return false;
      }
      
      console.log(`🧹 Cleaning duplicates in: ${relativePath}`);
      
      // Garder seulement le premier hook et supprimer les autres
      let firstHookFound = false;
      const lines = content.split('\n');
      
      const cleanedLines = lines.filter(line => {
        // Si c'est un hook useTranslation
        if (/const.*\{.*t.*\}.*=.*useTranslation/.test(line)) {
          if (firstHookFound) {
            console.log(`  ❌ Removing duplicate: ${line.trim()}`);
            return false; // Supprimer ce hook dupliqué
          } else {
            firstHookFound = true;
            console.log(`  ✅ Keeping first hook: ${line.trim()}`);
            return true; // Garder le premier hook
          }
        }
        return true;
      });
      
      content = cleanedLines.join('\n');
      
      // Supprimer aussi les lignes vides en trop causées par la suppression
      content = content.replace(/\n\s*\n\s*\n/g, '\n\n');
      
      fs.writeFileSync(filePath, content, 'utf8');
      this.cleanedFiles.push(relativePath);
      return true;
      
    } catch (error) {
      console.error(`❌ Error cleaning ${filePath}:`, error.message);
      return false;
    }
  }

  // Scanner et nettoyer tous les fichiers
  async cleanAllFiles(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        if (!['node_modules', '.git', 'dist', 'build'].includes(entry.name)) {
          await this.cleanAllFiles(fullPath);
        }
      } else if (entry.isFile()) {
        if (/\.(tsx|ts)$/.test(entry.name) && 
            !entry.name.includes('.test.') && 
            !entry.name.includes('BROKEN')) {
          
          this.cleanFile(fullPath);
        }
      }
    }
  }

  // Exécution complète
  async performCleanup() {
    console.log('🧹 CLEANING DUPLICATE useTranslation HOOKS...\n');
    
    await this.cleanAllFiles('client/src');
    
    console.log('\n' + '='.repeat(50));
    console.log('🎉 CLEANUP COMPLETED!');
    console.log('='.repeat(50));
    console.log(`✅ Files cleaned: ${this.cleanedFiles.length}`);
    
    if (this.cleanedFiles.length > 0) {
      console.log('\n📝 Cleaned files:');
      this.cleanedFiles.forEach(file => console.log(`  - ${file}`));
    }
    
    console.log('\n🚀 All duplicate hooks removed! Application should start now.');
  }
}

// Exécuter le nettoyage
const cleaner = new DuplicateHookCleaner();
cleaner.performCleanup().catch(console.error);