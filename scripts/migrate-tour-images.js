#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

// Mapping des noms de fichiers vers les IDs de tours (approximatif)
const imageToTourMapping = {
  'Semi private Phi Phi Morning': 'PIGyavyKH', // Semi Private Day Trip to Koh Phi Phi on morning
  'Semi private Koh Hong': 'L2gHLJBUh', // Semi Private Day Trip to Koh Hong Archipelago  
  'Railay Aventure': 'uSngHanqF', // Private Day Trip: The Secrets of Railay - Adventure Course
  'Railay 4 islands Semi private': 'FpfTOQaGA', // Semi Private Day Trip to Railay & Ao Nang's local islands with sunset and plankton
  'Railay + 4 islands sunset': '8avSq-g3e', // Private Day Trip to Railay & Ao Nang's local islands with sunset and plankton
  'Private Koh Hong': '9Pw3V8MEX', // Private Day Trip to Koh Hong Archipelago
  'Phang Nga Bay Long tail': 'NHCwbWtgGY', // Private day trip to Phang Nga: Koh Kudu and Koh Roi
  'Catamaran day trip': 'Wmx1GcKCG', // Catamaran Private Day Trip to Ao Nang's local islands
  'Hong + 4 silands sunset': 'IGdQFbdKF', // Private Day Trip to Koh Hong & Ao Nang's local islands with sunset and plankton
  'Hong + Phang Nga Bay Speedboat': 't1k3AxM19', // Private Day Trip to Phang Nga Bay : Koh Kudu and Koh Hong
  'Hong + Phang Nga speedbait 2': 't1k3AxM19', // Alternative pour le même tour
  'Kayak and natural pool': 'CeNxYxqbX', // Private Day Trip to Thalane - Mangrove kayaking & natural pools
  'Koh Kradan, Koh Ngai': 'o2mpYGR3l', // Private Day Trip to Koh Kradan & Koh Ngai
  'Koh Mook Sunset': 's0fLpx3q_', // Private Day Trip to Koh Mook with Sunset
  'Koh Phi Phi Sunset private speedboat': 'JfgH4lC6I', // Private day trip to Koh Phi Phi with sunset at Ao Nang local's islands
  'IMG_4675-min': '-Yzd7eCHa', // Private Day Trip to Krabi: Primary Forest and Waterfall
  'IMG_4867-min': 'Bh9zKvN-Q', // Private day trip: Ao Luk - Temple, Cave and Jungle
  'IMG_7206-min': 'LNoTTn_o0' // Private Day Trip to Laem Sak: Local Life in Phang Nga Bay
};

async function uploadImageWithDirectUrl() {
  const attachedAssetsDir = 'attached_assets';
  const basePublicUrl = 'https://9f6111db-4665-48c3-b1fa-c0185c759976-00-1pljxbb6k94go.janeway.replit.dev';
  
  console.log('🚀 Début de la migration des images...');
  
  // Copier les images vers les assets publics
  if (!fs.existsSync('public/tour-images')) {
    fs.mkdirSync('public/tour-images', { recursive: true });
    console.log('📁 Dossier public/tour-images créé');
  }
  
  let processedCount = 0;
  
  for (const [fileName, tourId] of Object.entries(imageToTourMapping)) {
    try {
      // Trouver le fichier correspondant
      const sourceFile = fs.readdirSync(attachedAssetsDir)
        .find(f => f.startsWith(fileName) && f.includes('1757511669'));
      
      if (!sourceFile) {
        console.log(`⚠️  Fichier non trouvé pour: ${fileName}`);
        continue;
      }
      
      const sourcePath = path.join(attachedAssetsDir, sourceFile);
      const extension = path.extname(sourceFile);
      const destinationFile = `${fileName.toLowerCase().replace(/[^a-z0-9]/g, '-')}${extension}`;
      const destinationPath = path.join('public/tour-images', destinationFile);
      
      // Copier le fichier
      fs.copyFileSync(sourcePath, destinationPath);
      
      // URL publique directe
      const imageUrl = `${basePublicUrl}/tour-images/${destinationFile}`;
      
      // Créer l'override avec URL directe
      const overrideData = {
        tourNinjaId: tourId,
        imageSourceType: 'url',
        directImageUrl: imageUrl,
        description: `Image personnalisée pour ${fileName}`
      };
      
      const response = await fetch('http://localhost:5000/api/admin/tour-ninja-images', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': 'connect.sid=YOUR_SESSION_ID' // Faudra remplacer par une session valide
        },
        body: JSON.stringify(overrideData)
      });
      
      if (response.ok) {
        console.log(`✅ ${fileName} -> ${tourId} (${imageUrl})`);
        processedCount++;
      } else {
        console.log(`❌ Erreur pour ${fileName}: ${response.statusText}`);
      }
      
    } catch (error) {
      console.log(`❌ Erreur lors du traitement de ${fileName}:`, error.message);
    }
  }
  
  console.log(`🎉 Migration terminée. ${processedCount} images traitées.`);
}

// Exécuter si appelé directement
if (require.main === module) {
  uploadImageWithDirectUrl().catch(console.error);
}

module.exports = { uploadImageWithDirectUrl, imageToTourMapping };