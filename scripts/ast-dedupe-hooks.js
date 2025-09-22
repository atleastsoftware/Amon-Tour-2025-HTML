#!/usr/bin/env node

/**
 * AST-BASED HOOK DEDUPLICATION - Solution définitive
 * Utilise @babel/parser et @babel/traverse pour détecter et corriger TOUS les hooks dupliqués
 */

import fs from 'fs';
import path from 'path';
import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import generate from '@babel/generator';

class ASTHookDeduplicator {
  constructor() {
    this.fixedFiles = [];
    this.totalDuplicatesRemoved = 0;
  }

  // Nettoyer un fichier avec AST
  deduplicateFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const relativePath = path.relative(process.cwd(), filePath);
      
      // Parser le fichier en AST
      const ast = parse(content, {
        sourceType: 'module',
        plugins: ['jsx', 'typescript']
      });

      let hasChanges = false;
      let duplicatesInFile = 0;

      // Traverser l'AST pour trouver les composants React
      traverse(ast, {
        // Fonctions de composant (function Component() {} ou const Component = () => {})
        'FunctionDeclaration|VariableDeclarator'(path) {
          const node = path.node;
          
          // Vérifier si c'est un composant React (nom commence par majuscule)
          let componentName = null;
          let componentBody = null;
          
          if (node.type === 'FunctionDeclaration' && node.id && /^[A-Z]/.test(node.id.name)) {
            componentName = node.id.name;
            componentBody = node.body;
          } else if (node.type === 'VariableDeclarator' && 
                     node.id && node.id.name && /^[A-Z]/.test(node.id.name) &&
                     node.init && (node.init.type === 'ArrowFunctionExpression' || 
                                   node.init.type === 'FunctionExpression')) {
            componentName = node.id.name;
            componentBody = node.init.body;
          }

          if (!componentName || !componentBody || componentBody.type !== 'BlockStatement') {
            return;
          }

          // Chercher tous les hooks useTranslation dans ce composant
          const useTranslationDeclarations = [];
          const destructuredProps = new Set();

          componentBody.body.forEach((stmt, index) => {
            if (stmt.type === 'VariableDeclaration') {
              stmt.declarations.forEach(decl => {
                if (decl.init && 
                    decl.init.type === 'CallExpression' && 
                    decl.init.callee && 
                    decl.init.callee.name === 'useTranslation') {
                  
                  useTranslationDeclarations.push({ stmt, index, decl });
                  
                  // Collecter les propriétés destructurées
                  if (decl.id && decl.id.type === 'ObjectPattern') {
                    decl.id.properties.forEach(prop => {
                      if (prop.type === 'ObjectProperty' && prop.key) {
                        destructuredProps.add(prop.key.name);
                      }
                    });
                  }
                }
              });
            }
          });

          // Si il y a plus d'un hook useTranslation, déduplication nécessaire
          if (useTranslationDeclarations.length > 1) {
            console.log(`🔧 ${relativePath}: Fixing ${componentName} (${useTranslationDeclarations.length} hooks)`);
            
            // Créer un nouveau hook unifié
            const unifiedProperties = Array.from(destructuredProps).map(prop => ({
              type: 'ObjectProperty',
              key: { type: 'Identifier', name: prop },
              value: { type: 'Identifier', name: prop },
              shorthand: true
            }));

            // Créer la nouvelle déclaration
            const newDeclaration = {
              type: 'VariableDeclaration',
              kind: 'const',
              declarations: [{
                type: 'VariableDeclarator',
                id: {
                  type: 'ObjectPattern',
                  properties: unifiedProperties
                },
                init: {
                  type: 'CallExpression',
                  callee: { type: 'Identifier', name: 'useTranslation' },
                  arguments: []
                }
              }]
            };

            // Remplacer le premier hook et supprimer les autres
            const firstIndex = useTranslationDeclarations[0].index;
            componentBody.body[firstIndex] = newDeclaration;

            // Supprimer les hooks dupliqués (en ordre inverse pour préserver les indices)
            useTranslationDeclarations.slice(1).reverse().forEach(({ index }) => {
              componentBody.body.splice(index, 1);
              duplicatesInFile++;
              this.totalDuplicatesRemoved++;
            });

            hasChanges = true;
            console.log(`  ✅ Unified into: const { ${Array.from(destructuredProps).join(', ')} } = useTranslation();`);
            console.log(`  ❌ Removed ${useTranslationDeclarations.length - 1} duplicate(s)`);
          }
        }
      });

      // Sauvegarder si des changements ont été faits
      if (hasChanges) {
        const output = generate(ast, { 
          retainLines: true,
          compact: false 
        });
        
        fs.writeFileSync(filePath, output.code, 'utf8');
        this.fixedFiles.push(`${relativePath} (${duplicatesInFile} duplicates removed)`);
        return true;
      }

      return false;

    } catch (error) {
      console.error(`❌ Error processing ${filePath}:`, error.message);
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
          
          this.deduplicateFile(fullPath);
        }
      }
    }
  }

  // Exécution complète
  async performDeduplication() {
    console.log('🔧 AST-BASED HOOK DEDUPLICATION STARTING...\n');
    
    await this.scanDirectory('client/src');
    
    console.log('\n' + '='.repeat(70));
    console.log('🎉 AST DEDUPLICATION COMPLETED!');
    console.log('='.repeat(70));
    console.log(`✅ Files fixed: ${this.fixedFiles.length}`);
    console.log(`❌ Total duplicates removed: ${this.totalDuplicatesRemoved}`);
    
    if (this.fixedFiles.length > 0) {
      console.log('\n📝 Fixed files:');
      this.fixedFiles.forEach(file => console.log(`  - ${file}`));
    }
    
    console.log('\n🚀 All useTranslation hooks deduplicated! Ready to test!');
    console.log('\n⚠️  RECOMMENDATION: Disable scripts/global-i18n-repair.js to prevent future duplicates');
  }
}

// Exécuter la déduplication AST
const deduplicator = new ASTHookDeduplicator();
deduplicator.performDeduplication().catch(console.error);