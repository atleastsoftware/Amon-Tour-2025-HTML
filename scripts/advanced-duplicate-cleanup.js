#!/usr/bin/env node

/**
 * NETTOYAGE AVANCÉ - Détecte et corrige TOUS les patterns de hooks dupliqués
 */

import fs from 'fs';
import path from 'path';

class AdvancedDuplicateCleaner {
  constructor() {
    this.fixedFiles = [];
    this.patterns = [
      // Pattern 1: Standard duplicates
      {
        name: 'Standard duplicates',
        regex: /const\s*\{\s*t\s*\}\s*=\s*useTranslation\(\)\s*;\s*\n\s*const\s*\{\s*t\s*\}\s*=\s*useTranslation\(\)\s*;/gm,
        fix: 'const { t } = useTranslation();'
      },
      // Pattern 2: Spread variations
      {
        name: 'Spread variations',
        regex: /const\s*\{\s*t\s*\}\s*=\s*useTranslation\(\)\s*;\s*\n\s*const\s*\{\s*\n\s*t\s*\n\s*\}\s*=\s*useTranslation\(\)\s*;/gm,
        fix: 'const { t } = useTranslation();'
      },
      // Pattern 3: t: t variations
      {
        name: 't: t variations',
        regex: /const\s*\{\s*t\s*\}\s*=\s*useTranslation\(\)\s*;\s*\n\s*const\s*\{\s*\n\s*t:\s*t\s*\n\s*\}\s*=\s*useTranslation\(\)\s*;/gm,
        fix: 'const { t } = useTranslation();'
      },
      // Pattern 4: i18n combinations
      {
        name: 'i18n combinations',
        regex: /const\s*\{\s*t\s*\}\s*=\s*useTranslation\(\)\s*;\s*\n\s*const\s*\{\s*\n\s*t,?\s*\n\s*i18n\s*\n\s*\}\s*=\s*useTranslation\(\)\s*;/gm,
        fix: 'const { t, i18n } = useTranslation();'
      }
    ];
  }

  // Correction manuelle avancée
  manualCleanup(content) {
    const lines = content.split('\n');
    const cleanedLines = [];
    let i = 0;
    let hasUseTranslation = false;
    
    while (i < lines.length) {
      const line = lines[i];
      
      // Détecter les hooks useTranslation
      if (/const.*\{.*t.*\}.*=.*useTranslation/.test(line)) {
        if (!hasUseTranslation) {
          // Premier hook - le garder
          cleanedLines.push(line);
          hasUseTranslation = true;
          
          // Vérifier s'il y a une ligne i18n qui suit
          if (i + 1 < lines.length && /i18n/.test(lines[i + 1])) {
            // Combinaison avec i18n
            cleanedLines[cleanedLines.length - 1] = line.replace(/\s*t\s*}/, ' t, i18n }');
            // Ignorer les lignes suivantes qui font partie du deuxième hook
            while (i + 1 < lines.length && (/i18n|const.*useTranslation|^\s*\}\s*=/.test(lines[i + 1]))) {
              i++;
            }
          }
        } else {
          // Hook dupliqué - l'ignorer
          console.log(`  ❌ Removing duplicate hook: ${line.trim()}`);
          // Ignorer aussi les lignes qui font partie de ce hook
          while (i + 1 < lines.length && (/^\s*[ti].*[,}]|^\s*\}\s*=/.test(lines[i + 1]))) {
            i++;
          }
        }
      } else {
        cleanedLines.push(line);
      }
      i++;
    }
    
    return cleanedLines.join('\n');
  }

  // Nettoyer un fichier
  cleanFile(filePath) {
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      const originalContent = content;
      const relativePath = path.relative(process.cwd(), filePath);
      
      // Vérifier s'il y a des hooks dupliqués
      const hookMatches = content.match(/const.*\{.*t.*\}.*=.*useTranslation/g) || [];
      if (hookMatches.length <= 1) {
        return false;
      }
      
      console.log(`🔧 Fixing: ${relativePath} (${hookMatches.length} hooks found)`);
      hookMatches.forEach(hook => console.log(`  📍 Found: ${hook.trim()}`));
      
      // Appliquer les patterns de nettoyage
      for (const pattern of this.patterns) {
        if (pattern.regex.test(content)) {
          console.log(`  ✨ Applying ${pattern.name} pattern`);
          content = content.replace(pattern.regex, pattern.fix);
        }
      }
      
      // Nettoyage manuel si les patterns n'ont pas fonctionné
      if (content === originalContent) {
        console.log(`  🔧 Applying manual cleanup`);
        content = this.manualCleanup(content);
      }
      
      // Supprimer les lignes vides en trop
      content = content.replace(/\n\s*\n\s*\n/g, '\n\n');
      
      if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        this.fixedFiles.push(relativePath);
        console.log(`  ✅ Fixed successfully`);
        return true;
      } else {
        console.log(`  ⚠️  No changes made`);
        return false;
      }
      
    } catch (error) {
      console.error(`❌ Error fixing ${filePath}:`, error.message);
      return false;
    }
  }

  // Scanner tous les fichiers
  async scanAllFiles(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        if (!['node_modules', '.git', 'dist', 'build'].includes(entry.name)) {
          await this.scanAllFiles(fullPath);
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
  async performAdvancedCleanup() {
    console.log('🔧 ADVANCED DUPLICATE HOOK CLEANUP...\n');
    
    await this.scanAllFiles('client/src');
    
    console.log('\n' + '='.repeat(60));
    console.log('🎉 ADVANCED CLEANUP COMPLETED!');
    console.log('='.repeat(60));
    console.log(`✅ Files fixed: ${this.fixedFiles.length}`);
    
    if (this.fixedFiles.length > 0) {
      console.log('\n📝 Fixed files:');
      this.fixedFiles.forEach(file => console.log(`  - ${file}`));
    }
    
    console.log('\n🚀 All duplicate hooks should be eliminated! Ready to test!');
  }
}

// Exécuter le nettoyage avancé
const cleaner = new AdvancedDuplicateCleaner();
cleaner.performAdvancedCleanup().catch(console.error);