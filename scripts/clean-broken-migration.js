#!/usr/bin/env node

/**
 * Script pour nettoyer les migrations i18n cassées
 * Enlève les t() incorrects et restaure la syntaxe TypeScript
 */

import fs from 'fs';

function cleanFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Enlève les t() incorrects dans les types TypeScript
    content = content.replace(/=>\{t\('([^']+)', \{ defaultValue: '[^']+' \}\)/g, '=> $1');
    content = content.replace(/: \{t\('([^']+)', \{ defaultValue: '[^']+' \}\)/g, ': $1');
    
    // Enlève les imports useTranslation en double ou incorrects
    const lines = content.split('\n');
    const cleanLines = lines.filter((line, index) => {
      // Garde seulement un import useTranslation
      if (line.includes("import { useTranslation } from 'react-i18next'")) {
        return index === lines.findIndex(l => l.includes("import { useTranslation } from 'react-i18next'"));
      }
      return true;
    });
    
    content = cleanLines.join('\n');
    
    // Enlève les hooks useTranslation en double
    content = content.replace(/(const \{ t \} = useTranslation\(\);\s*)+/g, 'const { t } = useTranslation();\n');
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Cleaned ${filePath}`);
    
  } catch (error) {
    console.error(`❌ Error cleaning ${filePath}:`, error.message);
  }
}

// Nettoie le fichier cassé
cleanFile('client/src/components/admin/FormBuilder.tsx');