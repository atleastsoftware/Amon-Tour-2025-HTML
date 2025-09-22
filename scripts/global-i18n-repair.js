#!/usr/bin/env node

/**
 * RÉPARATION GLOBALE I18N - Corrige TOUS les fichiers avec des erreurs "t is not defined"
 * Scanner complet et réparation automatique
 */

import fs from 'fs';
import path from 'path';

class GlobalI18nRepair {
  constructor() {
    this.fixedFiles = [];
    this.errors = [];
  }

  // Détecter les fichiers avec des erreurs t()
  hasTranslationErrors(content) {
    // Chercher les appels t() sans hook
    const hasTranslationCalls = /\bt\(/g.test(content);
    const hasUseTranslationImport = /import.*useTranslation.*from.*react-i18next/g.test(content);
    const hasUseTranslationHook = /const.*\{.*t.*\}.*=.*useTranslation/g.test(content);
    
    return hasTranslationCalls && hasUseTranslationImport && !hasUseTranslationHook;
  }

  // Réparer un fichier simple
  fixSimpleFile(filePath) {
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      const relativePath = path.relative(process.cwd(), filePath);
      
      console.log(`🔧 Fixing: ${relativePath}`);
      
      if (!this.hasTranslationErrors(content)) {
        console.log(`  ⚪ No t() errors detected`);
        return false;
      }

      // Trouver le composant principal
      const componentMatch = content.match(/export default function (\w+)\(\)/);
      if (!componentMatch) {
        console.log(`  ❌ No default function component found`);
        return false;
      }

      const componentName = componentMatch[1];
      
      // Vérifier si le hook n'existe pas déjà
      if (/const.*\{.*t.*\}.*=.*useTranslation/g.test(content)) {
        console.log(`  ⚪ useTranslation hook already exists`);
        return false;
      }

      // Ajouter le hook juste après la déclaration du composant
      const hookLine = `  const { t } = useTranslation();`;
      
      content = content.replace(
        /export default function \w+\(\)[^{]*\{/,
        (match) => `${match}\n${hookLine}`
      );

      fs.writeFileSync(filePath, content, 'utf8');
      this.fixedFiles.push(relativePath);
      console.log(`  ✅ Added useTranslation hook`);
      return true;

    } catch (error) {
      console.error(`  ❌ Error fixing ${filePath}:`, error.message);
      this.errors.push({ file: filePath, error: error.message });
      return false;
    }
  }

  // Scanner récursivement tous les fichiers
  async scanAndFixAll(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        if (!['node_modules', '.git', 'dist', 'build'].includes(entry.name)) {
          await this.scanAndFixAll(fullPath);
        }
      } else if (entry.isFile()) {
        if (/\.(tsx|ts|jsx|js)$/.test(entry.name) && 
            !entry.name.includes('.test.') && 
            !entry.name.includes('.spec.') &&
            !entry.name.includes('BROKEN') &&
            !entry.name.includes('DISABLED')) {
          
          await this.fixSimpleFile(fullPath);
        }
      }
    }
  }

  // Réparation complète
  async performGlobalRepair() {
    console.log('🔧 GLOBAL I18N REPAIR - Scanning entire codebase...\n');
    
    const startTime = Date.now();
    
    await this.scanAndFixAll('client/src');
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
    console.log('\n' + '='.repeat(60));
    console.log('🎉 GLOBAL REPAIR COMPLETED!');
    console.log('='.repeat(60));
    console.log(`⏱️  Duration: ${duration}s`);
    console.log(`✅ Files fixed: ${this.fixedFiles.length}`);
    console.log(`❌ Errors: ${this.errors.length}`);
    
    if (this.fixedFiles.length > 0) {
      console.log('\n📝 Fixed files:');
      this.fixedFiles.forEach(file => console.log(`  - ${file}`));
    }
    
    if (this.errors.length > 0) {
      console.log('\n⚠️  Errors encountered:');
      this.errors.forEach(({ file, error }) => {
        console.log(`  - ${path.relative(process.cwd(), file)}: ${error}`);
      });
    }
    
    console.log('\n🚀 Ready to test! All "t is not defined" errors should be fixed.');
  }
}

// Exécuter la réparation globale
const repair = new GlobalI18nRepair();
repair.performGlobalRepair().catch(console.error);