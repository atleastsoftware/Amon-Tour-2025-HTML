#!/usr/bin/env node

/**
 * Script de réparation rapide pour corriger les erreurs de l'automation i18n
 * Répare tous les fichiers avec des erreurs "t is not defined"
 */

import fs from 'fs';
import path from 'path';
import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import generate from '@babel/generator';
import t from '@babel/types';

class AutomationFixer {
  constructor() {
    this.fixedFiles = [];
    this.errors = [];
  }

  // Réparer un fichier spécifique
  async fixFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const relativePath = path.relative(process.cwd(), filePath);
      
      console.log(`🔧 Fixing: ${relativePath}`);
      
      const ast = parse(content, {
        sourceType: 'module',
        plugins: ['typescript', 'jsx']
      });

      let hasChanges = false;

      // 1. Supprimer les hooks useTranslation dupliqués
      traverse.default(ast, {
        FunctionDeclaration: (nodePath) => {
          if (this.isReactComponent(nodePath.node)) {
            this.cleanupDuplicateHooks(nodePath);
            hasChanges = true;
          }
        },
        VariableDeclarator: (nodePath) => {
          if (this.isReactComponent(nodePath.node)) {
            this.cleanupDuplicateHooks(nodePath);
            hasChanges = true;
          }
        }
      });

      // 2. S'assurer qu'il y a un hook useTranslation valide
      traverse.default(ast, {
        FunctionDeclaration: (nodePath) => {
          if (this.isReactComponent(nodePath.node)) {
            this.ensureValidUseTranslationHook(nodePath);
            hasChanges = true;
          }
        }
      });

      if (hasChanges) {
        const output = generate.default(ast, {
          retainLines: false,
          compact: false
        });
        
        fs.writeFileSync(filePath, output.code, 'utf8');
        this.fixedFiles.push(relativePath);
        console.log(`  ✅ Fixed: ${relativePath}`);
        return true;
      } else {
        console.log(`  ⚪ No changes needed: ${relativePath}`);
        return false;
      }

    } catch (error) {
      console.error(`  ❌ Error fixing ${filePath}:`, error.message);
      this.errors.push({ file: filePath, error: error.message });
      return false;
    }
  }

  // Vérifier si c'est un composant React
  isReactComponent(node) {
    if (t.isFunctionDeclaration(node)) {
      return node.id && /^[A-Z]/.test(node.id.name);
    }
    if (t.isVariableDeclarator(node)) {
      return node.id && t.isIdentifier(node.id) && /^[A-Z]/.test(node.id.name);
    }
    return false;
  }

  // Nettoyer les hooks dupliqués
  cleanupDuplicateHooks(nodePath) {
    let functionNode;
    
    if (t.isFunctionDeclaration(nodePath.node)) {
      functionNode = nodePath.node;
    } else if (t.isVariableDeclarator(nodePath.node) && t.isArrowFunctionExpression(nodePath.node.init)) {
      functionNode = nodePath.node.init;
    } else {
      return;
    }

    const body = functionNode.body;
    if (t.isBlockStatement(body)) {
      // Supprimer les hooks dupliqués
      const hookStatements = [];
      body.body = body.body.filter(stmt => {
        if (t.isVariableDeclaration(stmt) &&
            stmt.declarations.some(decl => 
              t.isObjectPattern(decl.id) &&
              decl.id.properties.some(prop => 
                t.isObjectProperty(prop) && 
                t.isIdentifier(prop.value) && 
                prop.value.name === 't'
              )
            )) {
          hookStatements.push(stmt);
          return hookStatements.length === 1; // Garder seulement le premier
        }
        return true;
      });
    }
  }

  // S'assurer qu'il y a un hook useTranslation valide
  ensureValidUseTranslationHook(nodePath) {
    let functionNode;
    
    if (t.isFunctionDeclaration(nodePath.node)) {
      functionNode = nodePath.node;
    } else {
      return;
    }

    const body = functionNode.body;
    if (t.isBlockStatement(body)) {
      // Vérifier si il y a déjà un hook correct
      const hasValidHook = body.body.some(stmt => 
        t.isVariableDeclaration(stmt) &&
        stmt.declarations.some(decl => 
          t.isObjectPattern(decl.id) &&
          decl.id.properties.some(prop => 
            t.isObjectProperty(prop) && 
            t.isIdentifier(prop.value) && 
            prop.value.name === 't'
          )
        )
      );

      if (!hasValidHook) {
        const hookStatement = t.variableDeclaration('const', [
          t.variableDeclarator(
            t.objectPattern([
              t.objectProperty(t.identifier('t'), t.identifier('t'))
            ]),
            t.callExpression(t.identifier('useTranslation'), [])
          )
        ]);
        body.body.unshift(hookStatement);
      }
    }
  }

  // Réparer tous les fichiers problématiques
  async fixAllProblematicFiles() {
    console.log('🔧 Starting automation error fix...\n');

    // Liste des fichiers à vérifier (ceux qui ont souvent des problèmes)
    const problematicFiles = [
      'client/src/components/LanguageSelector.tsx',
      'client/src/pages/stays.tsx',
      'client/src/pages/home.tsx',
      'client/src/pages/experiences.tsx',
      'client/src/pages/contact.tsx',
      'client/src/components/layout/Header.tsx',
      'client/src/components/layout/Footer.tsx'
    ];

    for (const filePath of problematicFiles) {
      if (fs.existsSync(filePath)) {
        await this.fixFile(filePath);
      }
    }

    console.log('\n📊 Fix Summary:');
    console.log(`  - Files fixed: ${this.fixedFiles.length}`);
    console.log(`  - Errors: ${this.errors.length}`);
    
    if (this.errors.length > 0) {
      console.log('\n❌ Errors encountered:');
      this.errors.forEach(({ file, error }) => {
        console.log(`  - ${file}: ${error}`);
      });
    }
    
    console.log('\n🎉 Automation errors fixed!');
  }
}

// Exécuter la réparation
const fixer = new AutomationFixer();
fixer.fixAllProblematicFiles().catch(console.error);