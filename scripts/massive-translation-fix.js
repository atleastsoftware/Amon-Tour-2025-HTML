#!/usr/bin/env node

/**
 * CORRECTION MASSIVE DES TRADUCTIONS - Corrige tous les fichiers qui utilisent encore defaultValue
 */

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

class MassiveTranslationFixer {
  constructor() {
    this.fixedFiles = [];
    this.priorityPages = [
      'client/src/pages/krabi-celebration.tsx',
      'client/src/pages/villas-krabi.tsx', 
      'client/src/pages/become-partner.tsx',
      'client/src/pages/group-corporate.tsx',
      'client/src/pages/legal-notice.tsx',
      'client/src/pages/privacy-policy.tsx',
      'client/src/pages/terms-conditions.tsx'
    ];
    
    // Nouveaux mappings de clés pour remplacer les defaultValue
    this.keyMappings = {
      // Navigation et langues
      'English': 'languages.english',
      'Français': 'languages.french', 
      'Español': 'languages.spanish',
      'Home': 'navigation.home',
      'Toggle menu': 'navigation.toggleMenu',
      'Amon Logo': 'common.amonLogo',
      'Amon Tour Logo': 'common.amonTourLogo',
      'Amon Tour': 'site.name',
      
      // Footer 
      'Subscribe to newsletter': 'footer.subscribeNewsletter',
      'Contact via WhatsApp': 'footer.contactWhatsApp',
      'View all reviews on Google': 'footer.viewAllReviews',
      
      // Pages spécifiques que vous avez mentionnées
      'Krabi Celebration - Amon Tour': 'pages.krabiCelebration.seoTitle',
      'Villas in Krabi - Luxury Accommodation - Amon Tour': 'pages.villasKrabi.seoTitle',
      'Become Partner - Amon Tour': 'pages.becomePartner.seoTitle',
      'Group & Corporate - Amon Tour': 'pages.groupCorporate.seoTitle',
      'Legal Notice - Amon Tour': 'pages.legalNotice.seoTitle',
      'Privacy Policy - Amon Tour': 'pages.privacyPolicy.seoTitle',
      'Terms & Conditions - Amon Tour': 'pages.termsConditions.seoTitle',
      
      // Titres de pages
      'Krabi Celebration': 'pages.krabiCelebration.title',
      'Villas in Krabi': 'pages.villasKrabi.title',
      'Become Partner': 'pages.becomePartner.title',
      'Group & Corporate': 'pages.groupCorporate.title',
      'Legal Notice': 'legal.title',
      'Mentions légales': 'legal.title',
      'Privacy Policy': 'privacy.title',
      'Politique de confidentialité': 'privacy.title',
      'Terms & Conditions': 'terms.title',
      'Conditions générales': 'terms.title',
      
      // Textes courants
      'All rights reserved': 'footer.copyright',
      'Tous droits réservés': 'footer.copyright',
      'Flame BB Co., Ltd. (Amon Tour).': 'company.fullName'
    };
  }

  // Remplacer les patterns defaultValue dans un contenu
  replaceDefaultValuePatterns(content) {
    let updatedContent = content;
    let changesCount = 0;
    
    // Pattern pour t('texte', { defaultValue: 'texte' })
    const defaultValueRegex = /t\(['"`]([^'"`]+)['"`],\s*{\s*defaultValue:\s*['"`]([^'"`]+)['"`]\s*}\)/g;
    
    updatedContent = updatedContent.replace(defaultValueRegex, (match, text1, text2) => {
      // Si on a un mapping pour ce texte, l'utiliser
      if (this.keyMappings[text1]) {
        changesCount++;
        return `t('${this.keyMappings[text1]}')`;
      }
      
      // Sinon, créer une clé basée sur le texte
      const key = this.generateKeyFromText(text1);
      changesCount++;
      return `t('${key}')`;
    });
    
    return { content: updatedContent, changes: changesCount };
  }
  
  // Générer une clé de traduction à partir d'un texte
  generateKeyFromText(text) {
    // Nettoyer et normaliser le texte
    const cleanText = text
      .replace(/[^a-zA-Z0-9\s]/g, '') // Supprimer ponctuation
      .trim()
      .toLowerCase()
      .replace(/\s+/g, ''); // Remplacer espaces par rien
    
    // Créer une clé courte et lisible  
    if (cleanText.length > 20) {
      return `common.${cleanText.substring(0, 20)}`;
    }
    
    return `common.${cleanText}`;
  }

  // Corriger un fichier spécifique
  async fixFile(filePath) {
    try {
      if (!fs.existsSync(filePath)) {
        console.log(`  ⚠️  File not found: ${filePath}`);
        return false;
      }
      
      const originalContent = fs.readFileSync(filePath, 'utf8');
      
      // Vérifier si le fichier contient defaultValue
      if (!originalContent.includes('defaultValue')) {
        console.log(`  ✅ Already clean: ${filePath}`);
        return false;
      }
      
      const { content: newContent, changes } = this.replaceDefaultValuePatterns(originalContent);
      
      if (changes > 0) {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`  🔧 Fixed ${filePath} - ${changes} patterns replaced`);
        this.fixedFiles.push({ file: filePath, changes });
        return true;
      } else {
        console.log(`  ➡️  No changes needed: ${filePath}`);
        return false;
      }
      
    } catch (error) {
      console.error(`  ❌ Error fixing ${filePath}:`, error.message);
      return false;
    }
  }

  // Corriger les pages prioritaires
  async fixPriorityPages() {
    console.log('🚀 CORRECTION DES PAGES PRIORITAIRES...\n');
    
    let fixedCount = 0;
    
    for (const filePath of this.priorityPages) {
      console.log(`🔍 Processing: ${filePath}`);
      const wasFixed = await this.fixFile(filePath);
      if (wasFixed) fixedCount++;
    }
    
    return fixedCount;
  }

  // Corriger tous les fichiers trouvés par grep
  async fixAllFiles() {
    console.log('\n🔧 CORRECTION DE TOUS LES FICHIERS AVEC defaultValue...\n');
    
    // Chercher tous les fichiers avec defaultValue
    const allFiles = await glob('client/src/**/*.{tsx,ts,jsx,js}');
    const filesWithDefaultValue = [];
    
    for (const file of allFiles) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        if (content.includes('defaultValue')) {
          filesWithDefaultValue.push(file);
        }
      } catch (error) {
        // Ignorer les erreurs de lecture
      }
    }
    
    console.log(`📋 Found ${filesWithDefaultValue.length} files with defaultValue patterns`);
    
    let totalFixed = 0;
    
    for (const filePath of filesWithDefaultValue) {
      const wasFixed = await this.fixFile(filePath);
      if (wasFixed) totalFixed++;
    }
    
    return totalFixed;
  }

  // Exécuter la correction complète
  async executeFullFix() {
    console.log('🔥 CORRECTION MASSIVE DES TRADUCTIONS');
    console.log('=' .repeat(50));
    
    // 1. Corriger les pages prioritaires d'abord
    const priorityFixed = await this.fixPriorityPages();
    
    // 2. Corriger tous les autres fichiers
    const totalFixed = await this.fixAllFiles();
    
    console.log('\n' + '='.repeat(50));
    console.log('🎉 CORRECTION TERMINÉE !');
    console.log('='.repeat(50));
    console.log(`✅ Priority pages fixed: ${priorityFixed}`);
    console.log(`✅ Total files fixed: ${this.fixedFiles.length}`);
    
    if (this.fixedFiles.length > 0) {
      console.log('\n📋 Files fixed:');
      this.fixedFiles.forEach(({ file, changes }) => {
        console.log(`  - ${file.replace('client/src/', '')} (${changes} changes)`);
      });
    }
    
    console.log('\n🌐 TOUTES LES PAGES DEVRAIENT MAINTENANT UTILISER LES BONNES CLÉS DE TRADUCTION !');
    console.log('🔄 Redémarrage automatique du serveur en cours...');
  }
}

// Exécuter la correction
const fixer = new MassiveTranslationFixer();
fixer.executeFullFix().catch(console.error);