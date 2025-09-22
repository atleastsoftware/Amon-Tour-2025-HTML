#!/usr/bin/env node

/**
 * CORRECTION RAPIDE DES ERREURS DE SYNTAXE
 * Corrige les erreurs créées par mon script précédent
 */

import fs from 'fs';

class QuickSyntaxFix {
  fixBlogPost() {
    const filePath = 'client/src/pages/blog-post.tsx';
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Remplacer les appels t() problématiques dans l'objet global
    const fixedContent = content
      .replace(/title: t\("([^"]+)", \{\s*defaultValue: "[^"]+"\s*\}\)/g, "title: '$1'")
      .replace(/description: t\("([^"]+)", \{\s*defaultValue: "[^"]+"\s*\}\)/g, "description: '$1'")
      .replace(/t\(undefined, \{\s*defaultValue: undefined\s*\}\)/g, "undefined");
    
    fs.writeFileSync(filePath, fixedContent, 'utf8');
    console.log('✅ Fixed blog-post.tsx syntax errors');
  }

  fixAdminFiles() {
    const files = [
      'client/src/pages/admin-blog.tsx',
      'client/src/pages/admin/availability-manager.tsx'
    ];
    
    files.forEach(filePath => {
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        const fixedContent = content
          .replace(/t\(undefined, \{\s*defaultValue: undefined\s*\}\)/g, "undefined")
          .replace(/placeholder: t\(undefined, \{\s*defaultValue: undefined\s*\}\)/g, "placeholder: undefined");
        
        if (content !== fixedContent) {
          fs.writeFileSync(filePath, fixedContent, 'utf8');
          console.log(`✅ Fixed ${filePath}`);
        }
      } catch (error) {
        console.log(`⚠️ Could not fix ${filePath}: ${error.message}`);
      }
    });
  }

  execute() {
    console.log('🔧 Quick syntax fix for translation errors...\n');
    this.fixBlogPost();
    this.fixAdminFiles();
    console.log('\n✅ All syntax errors should be fixed!');
  }
}

const fixer = new QuickSyntaxFix();
fixer.execute();