#!/usr/bin/env node

/**
 * SOLUTION SIMPLE ET EFFICACE - Nettoie les hooks dupliqués avec regex robuste
 */

import fs from 'fs';
import path from 'path';

class SimpleDuplicateFixer {
  constructor() {
    this.fixedFiles = [];
    this.totalFixes = 0;
  }

  // Fonction principale de nettoyage
  fixFile(filePath) {
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      const originalContent = content;
      const relativePath = path.relative(process.cwd(), filePath);

      // Pattern 1: Supprimer les hooks dupliqués consécutifs exacts
      const pattern1 = /const\s*\{\s*t\s*\}\s*=\s*useTranslation\(\)\s*;\s*\n\s*const\s*\{\s*t\s*\}\s*=\s*useTranslation\(\)\s*;/g;
      if (pattern1.test(content)) {
        content = content.replace(pattern1, 'const { t } = useTranslation();');
        console.log(`  ✅ Fixed Pattern 1 in ${relativePath}`);
      }

      // Pattern 2: Hook simple + hook multiline
      const pattern2 = /const\s*\{\s*t\s*\}\s*=\s*useTranslation\(\)\s*;\s*\n\s*const\s*\{\s*\n\s*t\s*\n\s*\}\s*=\s*useTranslation\(\)\s*;/g;
      if (pattern2.test(content)) {
        content = content.replace(pattern2, 'const { t } = useTranslation();');
        console.log(`  ✅ Fixed Pattern 2 in ${relativePath}`);
      }

      // Pattern 3: Hook simple + hook avec t: t
      const pattern3 = /const\s*\{\s*t\s*\}\s*=\s*useTranslation\(\)\s*;\s*\n\s*const\s*\{\s*\n\s*t:\s*t\s*\n\s*\}\s*=\s*useTranslation\(\)\s*;/g;
      if (pattern3.test(content)) {
        content = content.replace(pattern3, 'const { t } = useTranslation();');
        console.log(`  ✅ Fixed Pattern 3 in ${relativePath}`);
      }

      // Pattern 4: Hook + hook avec i18n
      const pattern4 = /const\s*\{\s*t\s*\}\s*=\s*useTranslation\(\)\s*;\s*\n\s*const\s*\{\s*\n\s*t,?\s*\n\s*i18n\s*\n\s*\}\s*=\s*useTranslation\(\)\s*;/g;
      if (pattern4.test(content)) {
        content = content.replace(pattern4, 'const { t, i18n } = useTranslation();');
        console.log(`  ✅ Fixed Pattern 4 (with i18n) in ${relativePath}`);
      }

      // Pattern 5: Approche ligne par ligne pour les cas complexes
      const lines = content.split('\n');
      const cleanedLines = [];
      let useTranslationFound = false;
      let skipUntilBrace = false;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        // Si on trouve un hook useTranslation
        if (/const.*\{.*t.*\}.*=.*useTranslation\(\)/.test(line)) {
          if (!useTranslationFound) {
            // Premier hook - le garder
            cleanedLines.push(line);
            useTranslationFound = true;
          } else {
            // Hook dupliqué - le skipper
            console.log(`  ❌ Skipping duplicate hook: ${line.trim()}`);
            
            // Si c'est un hook multiline, skipper jusqu'à la ligne de fermeture
            if (line.includes('{') && !line.includes('}')) {
              skipUntilBrace = true;
            }
            continue;
          }
        } else if (skipUntilBrace) {
          // Skipper les lignes qui font partie du hook multiline dupliqué
          if (line.includes('useTranslation()')) {
            skipUntilBrace = false;
            console.log(`  ❌ Skipping multiline hook end: ${line.trim()}`);
          } else {
            console.log(`  ❌ Skipping multiline hook part: ${line.trim()}`);
          }
          continue;
        } else {
          cleanedLines.push(line);
        }
      }

      // Rejoindre les lignes nettoyées
      if (cleanedLines.length !== lines.length) {
        content = cleanedLines.join('\n');
        console.log(`  🧹 Applied line-by-line cleanup (${lines.length - cleanedLines.length} lines removed)`);
      }

      // Nettoyage final des lignes vides en trop
      content = content.replace(/\n\s*\n\s*\n/g, '\n\n');

      // Sauvegarder si des changements ont été faits
      if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        this.fixedFiles.push(relativePath);
        this.totalFixes++;
        console.log(`  ✅ FIXED: ${relativePath}`);
        return true;
      }

      return false;

    } catch (error) {
      console.error(`❌ Error fixing ${filePath}:`, error.message);
      return false;
    }
  }

  // Scanner tous les fichiers
  async scanDirectory(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        if (!['node_modules', '.git', 'dist', 'build'].includes(entry.name)) {
          await this.scanDirectory(fullPath);
        }
      } else if (entry.isFile()) {
        if (/\.(tsx|ts|jsx|js)$/.test(entry.name) && 
            !entry.name.includes('.test.') && 
            !entry.name.includes('BROKEN')) {
          
          // Vérifier d'abord s'il y a des hooks dupliqués
          const content = fs.readFileSync(fullPath, 'utf8');
          const hookMatches = content.match(/const.*\{.*t.*\}.*=.*useTranslation/g) || [];
          
          if (hookMatches.length > 1) {
            console.log(`🔧 Processing: ${path.relative(process.cwd(), fullPath)} (${hookMatches.length} hooks)`);
            this.fixFile(fullPath);
          }
        }
      }
    }
  }

  // Exécution complète
  async performFix() {
    console.log('🔧 SIMPLE DUPLICATE HOOK FIXER STARTING...\n');
    
    await this.scanDirectory('client/src');
    
    console.log('\n' + '='.repeat(60));
    console.log('🎉 SIMPLE FIX COMPLETED!');
    console.log('='.repeat(60));
    console.log(`✅ Files fixed: ${this.totalFixes}`);
    
    if (this.fixedFiles.length > 0) {
      console.log('\n📝 Fixed files:');
      this.fixedFiles.forEach(file => console.log(`  - ${file}`));
    }
    
    console.log('\n🚀 All duplicates should be fixed! Testing application...');
  }
}

// Exécuter la correction simple
const fixer = new SimpleDuplicateFixer();
fixer.performFix().catch(console.error);