#!/usr/bin/env node

/**
 * CORRECTION COMPLÈTE DE TOUTES LES CLÉS TRONQUÉES
 * Trouve et corrige TOUTES les clés comme common.xxxxx créées par mon mauvais script
 */

import fs from 'fs';
import path from 'path';
import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import generate from '@babel/generator';
import t from '@babel/types';
import { glob } from 'glob';

class TruncatedKeysFixer {
  constructor() {
    this.fixedFiles = [];
    this.stats = {
      filesProcessed: 0,
      keysFixed: 0
    };
    
    // Mapping pour reconstituer les textes à partir des clés tronquées
    this.textMapping = {
      'common.personalizedservice': 'Personalized service',
      'common.eacheventisuniqueand': 'Each event is unique and tailored to your desires',
      'common.multilingualteam': 'Multilingual team',
      'common.frenchenglishandthai': 'French, English, and Thai speaking',
      'common.guaranteedauthentici': 'Guaranteed authenticity',
      'common.experiencesrootedint': 'Experiences rooted in Thai culture',
      'common.completelogistics': 'Complete logistics',
      'common.fromconceptiontoreal': 'From conception to realization',
      'common.planyourcelebration': 'Plan your celebration',
      'common.contactustodaytotran': 'Contact us today to transform your dreams into reality',
      'common.fullname': 'Full Name',
      'common.yourfullname': 'Your full name',
      'common.email': 'Email',
      'common.whatsappwithcountryc': 'WhatsApp with country code',
      'common.66xxxxxxxxx': '+66 XXXXXXXXX',
      'common.typeofcelebration': 'Type of celebration',
      'common.egweddingproposalann': 'e.g., Wedding, Proposal, Anniversary',
      'common.numberofguests': 'Number of guests',
      'common.approximatenumber': 'Approximate number',
      'common.desireddate': 'Desired date',
      'common.expectedbudget': 'Expected budget',
      'common.eg2000050000thb': 'e.g., 20,000 - 50,000 THB',
      'common.describeyourdreamcel': 'Describe your dream celebration',
      'common.adivisionofamontour': 'A division of Amon Tour',
      'common.krabicelebrationuniq': 'Krabi Celebration - Unique events in paradise',
      'common.uniquemomentsinanexc': 'Unique moments in an exceptional setting',
      'common.choosefromoursignatu': 'Choose from our signature experiences',
      'common.romanticdinneronpriv': 'Romantic dinner on private beach',
      'common.ud83cudf05romanticex': '🌅 Romantic experience',
      'common.theperfectexperience': 'The perfect experience for proposals and romantic dinners',
      'common.escapetoasecretbeach': 'Escape to a secret beach for an unforgettable evening',
      'common.thesetting': 'The setting',
      'common.privatebeachfacingth': 'Private beach facing the sunset with panoramic view',
      'common.themenu': 'The menu',
      'common.refinedbuffetofthais': 'Refined buffet of Thai specialties and international dishes',
      'common.theteam': 'The team',
      'common.22000thb': '22,000 THB',
      'common.optionsprofessionalp': 'Options: Professional photographer, additional decorations',
      'common.intimatebeachwedding': 'Intimate beach wedding',
      'common.ud83dudc8dintimatewe': '💍 Intimate wedding ceremony',
      'common.theceremonyofyourdre': 'The ceremony of your dreams on a paradisiacal beach',
      'common.beginwithatraditiona': 'Begin with a traditional Thai blessing',
      'common.theprogram': 'The program',
      'common.buddhistceremony4pmb': 'Buddhist ceremony 4pm, Beach celebration 6pm',
      'common.included': 'Included',
      'common.19500thb': '19,500 THB',
      'common.weddinginthesecretga': 'Wedding in the secret garden',
      'common.ud83cudf3fsecretgard': '🌿 Secret garden wedding',
      'common.beachweddinginaonamm': 'Beach wedding in Ao Nang for up to 20 guests',
      'common.imagineamagicalcerem': 'Imagine a magical ceremony in a tropical garden',
      'common.theconcept': 'The concept',
      'common.anintimateandrefined': 'An intimate and refined celebration',
      'common.2villaswith2bedrooms': '2 villas with 2 bedrooms each for your guests',
      'common.priceonrequest': 'Price on request',
      'common.contactus': 'Contact us',
      'common.junglecelebrationatm': 'Jungle celebration at Mae Ping River',
      'common.ud83cudf34junglecele': '🌴 Jungle celebration',
      'common.junglecelebration': 'Jungle celebration',
      'common.aspectacularweddingf': 'A spectacular wedding for up to 80 guests',
      'common.servicesincluded': 'Services included',
      'common.venuerentalphotograp': 'Venue rental, photography, catering, decoration',
      'common.from4900thb': 'From 4,900 THB',
      'common.examplefor50guests': 'Example for 50 guests',
      'common.whychoosekrabicelebr': 'Why choose Krabi Celebration?',
      'common.localexpertise': 'Local expertise'
    };
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
              if (key.startsWith('common.') && key.length > 10) {
                // Chercher le texte original
                const originalText = this.textMapping[key];
                
                if (originalText) {
                  // Remplacer par l'appel correct
                  const correctedCall = this.createCorrectCall(originalText);
                  nodePath.replaceWith(correctedCall);
                  hasChanges = true;
                  keysFixed++;
                  console.log(`  🔧 Fixed: ${key} → ${originalText}`);
                } else {
                  // Essayer de deviner le texte à partir de la clé tronquée
                  let guessedText = key.replace('common.', '').replace(/([a-z])([A-Z])/g, '$1 $2');
                  guessedText = guessedText.charAt(0).toUpperCase() + guessedText.slice(1);
                  
                  const correctedCall = this.createCorrectCall(guessedText);
                  nodePath.replaceWith(correctedCall);
                  hasChanges = true;
                  keysFixed++;
                  console.log(`  🔧 Guessed: ${key} → ${guessedText}`);
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
    console.log('🔧 CORRECTION DE TOUTES LES CLÉS TRONQUÉES');
    console.log('=' .repeat(50));
    console.log('🎯 Cible: Toutes les clés common.xxxxx');
    console.log('✅ Méthode: t(\'texte\', { defaultValue: \'texte\' })');
    console.log('=' .repeat(50));

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
    console.log('\n' + '='.repeat(50));
    console.log('🎉 CORRECTION TERMINÉE !');
    console.log('='.repeat(50));
    console.log(`✅ Files processed: ${this.stats.filesProcessed}`);
    console.log(`✅ Keys fixed: ${this.stats.keysFixed}`);

    if (this.fixedFiles.length > 0) {
      console.log('\n📋 Files modified:');
      this.fixedFiles.forEach(({ file, keysFixed }) => {
        console.log(`  - ${file} (${keysFixed} keys)`);
      });
    }

    console.log('\n🌐 TOUTES LES CLÉS TRONQUÉES DEVRAIENT MAINTENANT ÊTRE CORRIGÉES !');
  }
}

// Exécuter
const fixer = new TruncatedKeysFixer();
fixer.execute().catch(console.error);