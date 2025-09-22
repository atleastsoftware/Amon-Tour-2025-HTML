#!/usr/bin/env node

/**
 * Script de migration automatisée i18n
 * Enveloppe automatiquement TOUS les textes hardcodés avec t() 
 * SANS MODIFIER le contenu original du client
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const CONFIG = {
  srcDir: 'client/src',
  excludePatterns: [
    // Exclure les patterns qui ne sont pas des textes utilisateur
    /^[a-z-]+$/, // CSS classes, IDs courts
    /^(\.|\/)/, // Chemins
    /^https?:\/\//, // URLs
    /^[A-Z_]+$/, // Constantes
    /^\d+(\.\d+)?$/, // Nombres seuls
    /^[a-z]{2,3}$/, // Codes langue
    /^data-/, // Attributs data
    /^aria-/, // Déjà géré par aria
    /^[A-Z]{2,4}$/, // Codes (THB, USD, etc.)
    /^#[a-fA-F0-9]{3,6}$/, // Couleurs hex
    /^(sm|md|lg|xl)$/, // Breakpoints
    /^[0-9\-\s\(\)]+$/, // Téléphones
    /^[\w\.-]+@[\w\.-]+\.\w+$/, // Emails
  ],
  // Props qui contiennent du texte utilisateur
  textProps: [
    'title', 'subtitle', 'placeholder', 'alt', 'label', 
    'description', 'value', 'defaultValue', 'helperText',
    'aria-label', 'aria-describedby'
  ]
};

class I18nMigrator {
  constructor() {
    this.translations = new Set();
    this.processedFiles = 0;
    this.migratedStrings = 0;
  }

  // Vérifie si une string doit être traduite
  shouldTranslate(text) {
    if (!text || typeof text !== 'string') return false;
    if (text.length < 2) return false;
    if (text.length > 200) return false; // Probablement pas du texte UI
    
    // Exclut les patterns non-texte
    for (const pattern of CONFIG.excludePatterns) {
      if (pattern.test(text)) return false;
    }
    
    // Inclut le texte qui semble être pour l'utilisateur
    return /[a-zA-Z]/.test(text) && // Contient des lettres
           !/^[a-z][a-zA-Z]*$/.test(text); // Pas un nom de variable camelCase
  }

  // Trouve les textes hardcodés dans du JSX
  findHardcodedTexts(content) {
    const findings = [];

    // 1. Texte entre tags JSX: <tag>Texte ici</tag>
    const jsxTextRegex = />([^<>{]+)</g;
    let match;
    while ((match = jsxTextRegex.exec(content)) !== null) {
      const text = match[1].trim();
      if (this.shouldTranslate(text)) {
        findings.push({
          type: 'jsxText',
          original: match[0],
          text: text,
          replacement: `>{t('${text}', { defaultValue: '${text}' })}<`
        });
      }
    }

    // 2. Props avec strings: prop="Texte"
    for (const prop of CONFIG.textProps) {
      const propRegex = new RegExp(`${prop}=["']([^"']+)["']`, 'g');
      while ((match = propRegex.exec(content)) !== null) {
        const text = match[1];
        if (this.shouldTranslate(text)) {
          findings.push({
            type: 'prop',
            original: match[0],
            text: text,
            replacement: `${prop}={t('${text}', { defaultValue: '${text}' })}`
          });
        }
      }
    }

    // 3. Strings dans les expressions JSX: {"Texte"}
    const jsxExpressionRegex = /\{["']([^"']+)["']\}/g;
    while ((match = jsxExpressionRegex.exec(content)) !== null) {
      const text = match[1];
      if (this.shouldTranslate(text)) {
        findings.push({
          type: 'expression',
          original: match[0],
          text: text,
          replacement: `{t('${text}', { defaultValue: '${text}' })}`
        });
      }
    }

    return findings;
  }

  // Ajoute l'import useTranslation si nécessaire
  ensureTranslationImport(content) {
    if (content.includes("useTranslation")) return content;
    
    // Trouve où ajouter l'import
    const importLines = content.split('\n');
    let lastImportIndex = -1;
    
    for (let i = 0; i < importLines.length; i++) {
      if (importLines[i].startsWith('import ')) {
        lastImportIndex = i;
      }
    }
    
    if (lastImportIndex >= 0) {
      importLines.splice(lastImportIndex + 1, 0, "import { useTranslation } from 'react-i18next';");
    }
    
    return importLines.join('\n');
  }

  // Ajoute le hook useTranslation dans le composant
  addTranslationHook(content) {
    if (content.includes("useTranslation()")) return content;
    
    // Trouve le début de la fonction/composant
    const functionRegex = /(export default function \w+[^{]*\{[\s\n]*)/;
    const match = functionRegex.exec(content);
    
    if (match) {
      const hookLine = "  const { t } = useTranslation();\n";
      return content.replace(match[1], match[1] + hookLine);
    }
    
    return content;
  }

  // Traite un seul fichier
  async processFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Ignore si ce n'est pas un composant React
      if (!content.includes('jsx') && !content.includes('tsx')) return;
      if (!content.includes('<')) return; // Pas de JSX

      const findings = this.findHardcodedTexts(content);
      if (findings.length === 0) return;

      console.log(`📝 Migrating ${findings.length} strings in ${filePath}`);
      
      let newContent = content;

      // Applique les remplacements
      for (const finding of findings) {
        newContent = newContent.replace(finding.original, finding.replacement);
        this.translations.add(finding.text);
        this.migratedStrings++;
      }

      // Ajoute les imports/hooks nécessaires
      newContent = this.ensureTranslationImport(newContent);
      newContent = this.addTranslationHook(newContent);

      // Écrit le fichier modifié
      fs.writeFileSync(filePath, newContent, 'utf8');
      this.processedFiles++;

    } catch (error) {
      console.error(`❌ Error processing ${filePath}:`, error.message);
    }
  }

  // Parcourt tous les fichiers récursivement
  async processDirectory(dirPath) {
    const entries = fs.readdirSync(dirPath);
    
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        // Exclut certains dossiers
        if (!['node_modules', '.git', 'dist', 'build'].includes(entry)) {
          await this.processDirectory(fullPath);
        }
      } else if (entry.match(/\.(tsx?|jsx?)$/)) {
        await this.processFile(fullPath);
      }
    }
  }

  // Génère les clés de traduction dans les JSON
  generateTranslationFiles() {
    const translationsArray = Array.from(this.translations).sort();
    
    console.log('\n📚 Generating translation files...');
    
    // Charge les fichiers existants
    const localesDir = 'client/public/locales';
    const languages = ['en', 'fr', 'es'];
    
    for (const lang of languages) {
      const filePath = path.join(localesDir, lang, 'common.json');
      
      try {
        let existingTranslations = {};
        if (fs.existsSync(filePath)) {
          existingTranslations = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        }

        // Ajoute les nouvelles clés (avec le texte original comme valeur pour EN)
        for (const text of translationsArray) {
          if (!existingTranslations[text]) {
            // Pour l'anglais, utilise le texte original
            // Pour FR/ES, ajoute le texte anglais comme placeholder
            existingTranslations[text] = text;
          }
        }

        // Écrit le fichier mis à jour
        fs.writeFileSync(filePath, JSON.stringify(existingTranslations, null, 2), 'utf8');
        console.log(`✅ Updated ${filePath} with ${translationsArray.length} keys`);
        
      } catch (error) {
        console.error(`❌ Error updating ${filePath}:`, error.message);
      }
    }
  }

  // Lance la migration complète
  async migrate() {
    console.log('🚀 Starting automated i18n migration...');
    console.log(`📁 Scanning directory: ${CONFIG.srcDir}`);
    
    await this.processDirectory(CONFIG.srcDir);
    this.generateTranslationFiles();
    
    console.log('\n✨ Migration completed!');
    console.log(`📊 Processed ${this.processedFiles} files`);
    console.log(`🔤 Migrated ${this.migratedStrings} strings`);
    console.log(`📝 Generated ${this.translations.size} unique translation keys`);
    console.log('\n🎯 Next steps:');
    console.log('1. Review generated translations in FR/ES files');
    console.log('2. Test language switching on the website');
    console.log('3. Add ESLint rule to prevent future hardcoded strings');
  }
}

// Lance le script
if (import.meta.url === `file://${process.argv[1]}`) {
  const migrator = new I18nMigrator();
  migrator.migrate().catch(console.error);
}