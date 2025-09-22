#!/usr/bin/env node

/**
 * CORRECTION INTELLIGENTE FINALE DE TOUTES LES CLÉS TRONQUÉES
 * Utilise les fichiers de traduction pour retrouver automatiquement le texte complet
 */

import fs from 'fs';
import path from 'path';
import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import generate from '@babel/generator';
import t from '@babel/types';
import { glob } from 'glob';

class IntelligentTranslationFixer {
  constructor() {
    this.fixedFiles = [];
    this.stats = {
      filesProcessed: 0,
      keysFixed: 0,
      unresolvedKeys: []
    };
    
    // Index de tous les textes anglais des fichiers de traduction
    this.englishTexts = new Map(); // normalizedText -> originalText
    this.loadEnglishIndex();
  }

  // Charger tous les textes anglais des fichiers de traduction
  loadEnglishIndex() {
    console.log('🔍 Loading English translation index...');
    
    try {
      // Charger tous les fichiers JSON de traduction anglaise
      const localeFiles = glob.sync('client/public/locales/en/**/*.json');
      
      for (const file of localeFiles) {
        const content = JSON.parse(fs.readFileSync(file, 'utf8'));
        this.extractTexts(content);
      }
      
      console.log(`✅ Loaded ${this.englishTexts.size} English texts for matching`);
    } catch (error) {
      console.warn('⚠️ Could not load English index:', error.message);
    }
  }

  // Extraire récursivement tous les textes d'un objet JSON
  extractTexts(obj, prefix = '') {
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string' && value.trim()) {
        // Normaliser le texte pour la correspondance
        const normalized = this.normalizeText(value);
        this.englishTexts.set(normalized, value);
      } else if (typeof value === 'object' && value !== null) {
        this.extractTexts(value, prefix ? `${prefix}.${key}` : key);
      }
    }
  }

  // Normaliser un texte pour la correspondance
  normalizeText(text) {
    return text.toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .trim();
  }

  // Trouver la meilleure correspondance pour une clé tronquée
  findBestMatch(truncatedKey) {
    const normalized = this.normalizeText(truncatedKey);
    
    // 1. Correspondance exacte
    if (this.englishTexts.has(normalized)) {
      return this.englishTexts.get(normalized);
    }
    
    // 2. Recherche par préfixe (le texte tronqué est le début d'un texte plus long)
    for (const [normalizedText, originalText] of this.englishTexts.entries()) {
      if (normalizedText.startsWith(normalized) && normalizedText.length > normalized.length) {
        return originalText;
      }
    }
    
    // 3. Recherche par inclusion (le texte tronqué est contenu dans un texte plus long)
    for (const [normalizedText, originalText] of this.englishTexts.entries()) {
      if (normalizedText.includes(normalized) && normalizedText.length > normalized.length) {
        return originalText;
      }
    }
    
    // 4. Fallback : essayer de deviner à partir du nom de clé
    return this.guessFromKey(truncatedKey);
  }

  // Deviner le texte à partir d'une clé tronquée
  guessFromKey(key) {
    // Convertir camelCase en mots séparés
    let guessed = key
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/([A-Z])([A-Z][a-z])/g, '$1 $2')
      .toLowerCase();
    
    // Première lettre en majuscule
    guessed = guessed.charAt(0).toUpperCase() + guessed.slice(1);
    
    return guessed;
  }

  // Créer l'appel t() correct avec defaultValue
  createCorrectCall(originalText) {
    return t.callExpression(
      t.identifier('t'),
      [
        t.stringLiteral(originalText),
        t.objectExpression([
          t.objectProperty(
            t.identifier('defaultValue'),
            t.stringLiteral(originalText)
          )
        ])
      ]
    );
  }

  // Vérifier si une clé est tronquée
  isTruncatedKey(key) {
    // Clé sans namespace et > 10 caractères, probablement tronquée
    return /^[A-Za-z][^.\s]{10,}$/.test(key) && !key.includes('.');
  }

  // Traiter un fichier
  async processFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Parser le fichier
      const ast = parse(content, {
        sourceType: 'module',
        plugins: [
          'typescript', 
          'jsx', 
          'decorators-legacy',
          'classProperties',
          'objectRestSpread',
          'functionBind',
          'exportDefaultFrom',
          'exportNamespaceFrom',
          'dynamicImport'
        ]
      });

      let hasChanges = false;
      let keysFixed = 0;

      // Trouver et corriger tous les appels t() avec des clés tronquées
      traverse.default(ast, {
        CallExpression: (nodePath) => {
          const callExpr = nodePath.node;
          
          // Vérifier si c'est un appel t()
          if (t.isIdentifier(callExpr.callee, { name: 't' })) {
            const firstArg = callExpr.arguments[0];
            
            if (t.isStringLiteral(firstArg)) {
              const key = firstArg.value;
              
              // Vérifier si c'est une clé tronquée
              if (this.isTruncatedKey(key)) {
                // Vérifier si defaultValue = clé (signe que c'est cassé)
                const secondArg = callExpr.arguments[1];
                let needsFix = false;
                
                if (!secondArg) {
                  needsFix = true;
                } else if (t.isObjectExpression(secondArg)) {
                  const defaultValueProp = secondArg.properties.find(prop => 
                    t.isObjectProperty(prop) && 
                    t.isIdentifier(prop.key, { name: 'defaultValue' })
                  );
                  
                  if (defaultValueProp && t.isStringLiteral(defaultValueProp.value)) {
                    needsFix = defaultValueProp.value.value === key;
                  }
                }
                
                if (needsFix) {
                  // Trouver le texte correct
                  const correctText = this.findBestMatch(key);
                  
                  if (correctText !== key) {
                    // Remplacer par l'appel correct
                    const correctedCall = this.createCorrectCall(correctText);
                    nodePath.replaceWith(correctedCall);
                    hasChanges = true;
                    keysFixed++;
                    console.log(`  🔧 Fixed: "${key}" → "${correctText}"`);
                  } else {
                    // Ajouter à la liste des non résolus
                    this.stats.unresolvedKeys.push({ file: filePath, key });
                    console.log(`  ⚠️ Unresolved: "${key}"`);
                  }
                }
              }
            }
          }
        }
      });

      // Sauvegarder si changements
      if (hasChanges) {
        const result = generate.default(ast, { 
          retainLines: false,
          compact: false 
        });
        
        fs.writeFileSync(filePath, result.code);
        this.fixedFiles.push({
          file: path.relative(process.cwd(), filePath),
          keysFixed
        });
        this.stats.filesProcessed++;
        this.stats.keysFixed += keysFixed;
        console.log(`  ✅ Fixed ${path.relative(process.cwd(), filePath)} - ${keysFixed} keys corrected`);
      }
      
    } catch (error) {
      console.error(`❌ Error processing ${filePath}:`, error.message);
    }
  }

  // Exécuter la correction sur tous les fichiers
  async execute() {
    console.log('🔧 CORRECTION INTELLIGENTE FINALE DES TRADUCTIONS');
    console.log('=' .repeat(60));
    console.log('🎯 Cible: Toutes les clés tronquées sans namespace');
    console.log('🧠 Méthode: Correspondance intelligente avec index anglais');
    console.log('=' .repeat(60));

    // Trouver tous les fichiers React/TypeScript
    const allFiles = await glob('client/src/**/*.{tsx,ts,jsx,js}', {
      ignore: ['**/*.d.ts', '**/node_modules/**']
    });

    console.log(`\n📋 Found ${allFiles.length} files to check\n`);

    // Traiter chaque fichier
    for (const file of allFiles) {
      console.log(`🔍 Checking: ${path.relative(process.cwd(), file)}`);
      await this.processFile(file);
    }

    // Résultats
    console.log('\n' + '='.repeat(60));
    console.log('🎉 CORRECTION INTELLIGENTE TERMINÉE !');
    console.log('='.repeat(60));
    console.log(`✅ Files processed: ${this.stats.filesProcessed}`);
    console.log(`✅ Keys fixed: ${this.stats.keysFixed}`);

    if (this.fixedFiles.length > 0) {
      console.log('\n📋 Files modified:');
      this.fixedFiles.forEach(({ file, keysFixed }) => {
        console.log(`  - ${file} (${keysFixed} keys)`);
      });
    }

    if (this.stats.unresolvedKeys.length > 0) {
      console.log('\n⚠️ Unresolved keys (need manual fix):');
      this.stats.unresolvedKeys.forEach(({ file, key }) => {
        console.log(`  - ${path.relative(process.cwd(), file)}: "${key}"`);
      });
    }

    console.log('\n🌐 TOUTES LES CLÉS TRONQUÉES DEVRAIENT MAINTENANT ÊTRE CORRIGÉES !');
  }
}

// Exécuter
const fixer = new IntelligentTranslationFixer();
fixer.execute().catch(console.error);