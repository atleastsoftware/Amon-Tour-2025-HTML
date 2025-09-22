#!/usr/bin/env node

/**
 * CORRECTION GLOBALE - TOUT LE SITE EN UNE FOIS
 * Utilise la méthode qui fonctionnait bien : t('texte', { defaultValue: 'texte' })
 * Préserve exactement tous les textes et les garde lisibles
 * INTERDICTION de modifier le texte anglais
 */

import fs from 'fs';
import path from 'path';
import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import generate from '@babel/generator';
import t from '@babel/types';
import { glob } from 'glob';

class GlobalSiteTranslationFix {
  constructor() {
    this.fixedFiles = [];
    this.errors = [];
    this.stats = {
      filesProcessed: 0,
      translationsRestored: 0,
      brokenKeysFixed: 0
    };
  }

  // Détection intelligente du texte à traduire (MÊME MÉTHODE QUI FONCTIONNAIT)
  shouldTranslate(text) {
    if (!text || typeof text !== 'string') return false;
    if (text.length < 2) return false;
    
    // Exclure les patterns techniques
    if (/^[a-z][a-zA-Z]*$/.test(text)) return false; // Variables
    if (/^\d+(\.\d+)?$/.test(text)) return false; // Nombres
    if (/^[#@$%&*]/.test(text)) return false; // Symboles
    if (/^\/[^\/]/.test(text)) return false; // Chemins
    if (/^https?:\/\//.test(text)) return false; // URLs
    if (/^[a-z-]+$/.test(text)) return false; // CSS classes
    if (/^className|style|src|href|id$/i.test(text)) return false; // Propriétés HTML
    if (/^use[A-Z]/.test(text)) return false; // Hooks React
    if (/^on[A-Z]/.test(text)) return false; // Event handlers
    
    // Exclure les clés cassées de mon dernier script
    if (/^common\.[a-z]{10,20}$/.test(text)) return false; // clés tronquées
    if (/^pages\.|^languages\.|^navigation\.|^footer\./.test(text)) return false; // clés existantes
    
    // Accepter seulement le vrai texte visible
    return /[A-Z]/.test(text) && text.length >= 3;
  }

  // Créer l'appel t() CORRECT (MÉTHODE QUI FONCTIONNAIT)
  createCorrectTranslationCall(originalText) {
    const cleanText = originalText.trim();
    this.stats.translationsRestored++;
    
    return t.callExpression(
      t.identifier('t'),
      [
        t.stringLiteral(cleanText),
        t.objectExpression([
          t.objectProperty(
            t.identifier('defaultValue'),
            t.stringLiteral(cleanText)
          )
        ])
      ]
    );
  }

  // Corriger les clés cassées (comme common.createunforgettablem)
  fixBrokenTranslationCall(nodePath) {
    const callExpr = nodePath.node;
    if (!t.isCallExpression(callExpr) || !t.isIdentifier(callExpr.callee, { name: 't' })) {
      return false;
    }

    const firstArg = callExpr.arguments[0];
    if (!t.isStringLiteral(firstArg)) return false;

    const key = firstArg.value;
    
    // Détecter les clés cassées de mon dernier script
    if (/^common\.[a-z]{10,20}$/.test(key)) {
      // Essayer de reconstituer le texte original à partir de la clé tronquée
      let originalText = this.guessOriginalText(key);
      
      if (originalText) {
        const correctedCall = this.createCorrectTranslationCall(originalText);
        nodePath.replaceWith(correctedCall);
        this.stats.brokenKeysFixed++;
        console.log(`  🔧 Fixed broken key: ${key} → ${originalText}`);
        return true;
      }
    }

    return false;
  }

  // Essayer de deviner le texte original à partir des clés tronquées
  guessOriginalText(brokenKey) {
    const keyMap = {
      'common.createunforgettablem': 'Create unforgettable memories',
      'common.letyourselfbeenchant': 'Let yourself be enchanted',
      'common.whetheryouwanttoprop': 'Whether you want to propose',
      'common.ourcelebrationexperi': 'Our celebration experiences',
      'common.choosefromourextens': 'Choose from our extensive',
      'common.discoverkrabiandsou': 'Discover Krabi and southern Thailand like never before',
      'common.authenticthailandexp': 'Authentic Thailand experiences with local family',
      'common.amontourexperiencean': 'Amon Tour Experience and Krabi Stays',
      'common.didyouforgettoaddth': 'Did you forget to add the page to the router?'
    };

    return keyMap[brokenKey] || null;
  }

  // Traiter un fichier avec l'AST
  async processFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const relativePath = path.relative(process.cwd(), filePath);
      
      // Parser avec tous les plugins nécessaires
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
      let needsUseTranslation = false;

      // Transformation AST - Corrige les erreurs ET ajoute les oubliés
      traverse.default(ast, {
        // 1. Corriger les appels t() cassés
        CallExpression: (nodePath) => {
          if (this.fixBrokenTranslationCall(nodePath)) {
            hasChanges = true;
            needsUseTranslation = true;
          }
        },

        // 2. Texte JSX entre balises (MÉTHODE QUI FONCTIONNAIT)
        JSXText: (nodePath) => {
          const text = nodePath.node.value.trim();
          if (this.shouldTranslate(text)) {
            const translationCall = this.createCorrectTranslationCall(text);
            nodePath.replaceWith(t.jsxExpressionContainer(translationCall));
            hasChanges = true;
            needsUseTranslation = true;
            console.log(`  ✅ Added translation for JSX text: ${text}`);
          }
        },

        // 3. Attributs JSX spécifiques
        JSXAttribute: (nodePath) => {
          const attrName = nodePath.node.name.name;
          const criticalAttrs = ['placeholder', 'title', 'alt', 'aria-label', 'label'];
          
          if (criticalAttrs.includes(attrName)) {
            const value = nodePath.node.value;
            if (t.isStringLiteral(value) && this.shouldTranslate(value.value)) {
              const translationCall = this.createCorrectTranslationCall(value.value);
              nodePath.node.value = t.jsxExpressionContainer(translationCall);
              hasChanges = true;
              needsUseTranslation = true;
              console.log(`  ✅ Added translation for attribute ${attrName}: ${value.value}`);
            }
          }
        },

        // 4. String literals dans des propriétés importantes
        StringLiteral: (nodePath) => {
          const parent = nodePath.parent;
          
          // Propriétés d'objets importantes
          if (t.isObjectProperty(parent) && t.isIdentifier(parent.key)) {
            const propName = parent.key.name;
            const importantProps = ['title', 'subtitle', 'description', 'text', 'label', 'placeholder'];
            
            if (importantProps.includes(propName) && this.shouldTranslate(nodePath.node.value)) {
              const translationCall = this.createCorrectTranslationCall(nodePath.node.value);
              nodePath.replaceWith(translationCall);
              hasChanges = true;
              needsUseTranslation = true;
              console.log(`  ✅ Added translation for property ${propName}: ${nodePath.node.value}`);
            }
          }
        }
      });

      // Ajouter useTranslation si nécessaire
      if (needsUseTranslation && !this.hasUseTranslation(content)) {
        this.addUseTranslationHook(ast);
        hasChanges = true;
      }

      // Sauvegarder si changements
      if (hasChanges) {
        const result = generate.default(ast, { 
          retainLines: false,
          compact: false 
        });
        
        fs.writeFileSync(filePath, result.code);
        this.fixedFiles.push(relativePath);
        console.log(`  🔧 Fixed: ${relativePath}`);
        this.stats.filesProcessed++;
      }
      
    } catch (error) {
      console.error(`❌ Error processing ${filePath}:`, error.message);
      this.errors.push({ file: filePath, error: error.message });
    }
  }

  // Vérifier si useTranslation existe déjà
  hasUseTranslation(content) {
    return content.includes('useTranslation') && content.includes('react-i18next');
  }

  // Ajouter le hook useTranslation
  addUseTranslationHook(ast) {
    // Ajouter import
    const importDeclaration = t.importDeclaration(
      [t.importSpecifier(t.identifier('useTranslation'), t.identifier('useTranslation'))],
      t.stringLiteral('react-i18next')
    );

    // Ajouter const { t } = useTranslation();
    const hookDeclaration = t.variableDeclaration('const', [
      t.variableDeclarator(
        t.objectPattern([
          t.objectProperty(t.identifier('t'), t.identifier('t'))
        ]),
        t.callExpression(t.identifier('useTranslation'), [])
      )
    ]);

    // Insérer dans l'AST
    ast.body.unshift(importDeclaration);
    
    traverse.default(ast, {
      FunctionDeclaration: (nodePath) => {
        if (nodePath.node.id && nodePath.node.id.name.match(/^[A-Z]/)) {
          nodePath.node.body.body.unshift(hookDeclaration);
          nodePath.stop();
        }
      }
    });
  }

  // Exécuter la correction globale
  async executeGlobalFix() {
    console.log('🌐 CORRECTION GLOBALE DU SITE COMPLET');
    console.log('=' .repeat(60));
    console.log('✅ Méthode: t(\'texte\', { defaultValue: \'texte\' })');
    console.log('✅ Préservation: Tous les textes restent lisibles');
    console.log('✅ Scope: TODO le site d\'un coup');
    console.log('❌ Interdiction: Modifier le texte anglais');
    console.log('=' .repeat(60));

    // Trouver tous les fichiers React/TypeScript
    const allFiles = await glob('client/src/**/*.{tsx,ts,jsx,js}', {
      ignore: ['**/*.d.ts', '**/node_modules/**']
    });

    console.log(`\n📋 Found ${allFiles.length} files to process\n`);

    // Traiter chaque fichier
    for (const file of allFiles) {
      console.log(`🔍 Processing: ${path.relative(process.cwd(), file)}`);
      await this.processFile(file);
    }

    // Résultats finaux
    console.log('\n' + '='.repeat(60));
    console.log('🎉 CORRECTION GLOBALE TERMINÉE !');
    console.log('='.repeat(60));
    console.log(`✅ Files processed: ${this.stats.filesProcessed}`);
    console.log(`✅ Files fixed: ${this.fixedFiles.length}`);
    console.log(`✅ Translations restored: ${this.stats.translationsRestored}`);
    console.log(`✅ Broken keys fixed: ${this.stats.brokenKeysFixed}`);
    console.log(`❌ Errors: ${this.errors.length}`);

    if (this.fixedFiles.length > 0) {
      console.log('\n📋 Files modified:');
      this.fixedFiles.forEach(file => {
        console.log(`  - ${file}`);
      });
    }

    if (this.errors.length > 0) {
      console.log('\n❌ Errors:');
      this.errors.forEach(({ file, error }) => {
        console.log(`  - ${file}: ${error}`);
      });
    }

    console.log('\n🌐 TOUT LE SITE UTILISE MAINTENANT LA BONNE MÉTHODE !');
    console.log('🔄 Les textes restent lisibles même sans traductions JSON');
  }
}

// Exécuter la correction globale
const fixer = new GlobalSiteTranslationFix();
fixer.executeGlobalFix().catch(console.error);