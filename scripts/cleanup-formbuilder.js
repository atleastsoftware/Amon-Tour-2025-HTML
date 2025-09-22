#!/usr/bin/env node

/**
 * Script pour nettoyer agressivement FormBuilder.tsx des corruptions du script automatique
 */

import fs from 'fs';

function cleanupFormBuilder() {
  const filePath = 'client/src/components/admin/FormBuilder.tsx';
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    console.log('🧹 Cleaning FormBuilder.tsx...');
    
    // Supprimer les fragments t() brisés
    content = content.replace(/\{t\('\s*$/gm, '');
    content = content.replace(/^.*', \{ defaultValue: '\s*$/gm, '');
    content = content.replace(/^\s*' \}\)}<.*$/gm, '');
    
    // Nettoyer les lignes brisées avec des fragments
    content = content.replace(/\)\{t\(.*$/gm, ');');
    content = content.replace(/^.*\{ defaultValue: .*$/gm, '');
    
    // Supprimer les case dupliqués
    content = content.replace(/case 'textarea':\s+return \(\s+case 'textarea':/g, 'case \'textarea\':');
    content = content.replace(/case 'select':\s+return \(\s+case 'select':/g, 'case \'select\':');
    
    // Nettoyer les retours cassés
    content = content.replace(/return \(\s*$/gm, 'return (');
    
    // Nettoyer les lignes vides en trop
    content = content.replace(/\n\s*\n\s*\n/g, '\n\n');
    
    // S'assurer qu'on a l'import useTranslation une seule fois
    const lines = content.split('\n');
    const useTranslationImports = lines.filter(line => line.includes("import { useTranslation } from 'react-i18next'"));
    
    if (useTranslationImports.length > 1) {
      // Garder seulement le premier import
      let foundFirst = false;
      content = lines.filter(line => {
        if (line.includes("import { useTranslation } from 'react-i18next'")) {
          if (foundFirst) return false;
          foundFirst = true;
        }
        return true;
      }).join('\n');
    }
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('✅ FormBuilder.tsx cleaned successfully');
    
  } catch (error) {
    console.error('❌ Error cleaning FormBuilder.tsx:', error.message);
  }
}

cleanupFormBuilder();