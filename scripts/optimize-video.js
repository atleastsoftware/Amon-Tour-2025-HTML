#!/usr/bin/env node

/**
 * Script d'optimisation vidéo pour le hero background
 * Réduit la taille de 40MB à ~2-3MB avec ffmpeg
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const originalVideo = 'attached_assets/Catamaran cruise around Ao Nang local islands_1750216800850.mp4';
const optimizedVideo = 'attached_assets/hero-video-optimized.mp4';

function checkFFmpeg() {
  try {
    execSync('ffmpeg -version', { stdio: 'ignore' });
    return true;
  } catch (error) {
    return false;
  }
}

function optimizeVideo() {
  if (!fs.existsSync(originalVideo)) {
    console.error('❌ Fichier vidéo original non trouvé:', originalVideo);
    process.exit(1);
  }

  if (!checkFFmpeg()) {
    console.error('❌ FFmpeg n\'est pas installé. Installation requise pour l\'optimisation vidéo.');
    console.log('🔧 Sur Ubuntu/Debian: sudo apt install ffmpeg');
    console.log('🔧 Sur macOS: brew install ffmpeg');
    console.log('🔧 Sur Windows: téléchargez depuis https://ffmpeg.org/download.html');
    process.exit(1);
  }

  console.log('🎬 Optimisation de la vidéo en cours...');
  console.log('📁 Fichier source:', originalVideo);
  console.log('💾 Taille originale:', Math.round(fs.statSync(originalVideo).size / 1024 / 1024) + 'MB');

  try {
    // Commande FFmpeg optimisée pour vidéo d'arrière-plan web
    const ffmpegCommand = [
      'ffmpeg',
      '-i', `"${originalVideo}"`,
      '-c:v libx264',           // Codec vidéo H.264
      '-preset fast',           // Preset rapide
      '-crf 28',               // Qualité (23=haute, 28=moyenne, 32=basse)
      '-maxrate 1M',           // Débit max 1Mbps
      '-bufsize 2M',           // Buffer size
      '-vf "scale=1280:720"',  // Résolution 720p (suffisant pour background)
      '-r 24',                 // 24 FPS (suffisant pour background)
      '-an',                   // Pas d'audio (économise de l'espace)
      '-movflags +faststart',  // Optimisation streaming
      '-y',                    // Overwrite sans demander
      `"${optimizedVideo}"`
    ].join(' ');

    console.log('⚙️  Exécution de la commande d\'optimisation...');
    execSync(ffmpegCommand, { stdio: 'inherit' });

    const originalSize = fs.statSync(originalVideo).size;
    const optimizedSize = fs.statSync(optimizedVideo).size;
    const compression = Math.round((1 - optimizedSize / originalSize) * 100);

    console.log('✅ Optimisation terminée avec succès !');
    console.log('📊 Résultats:');
    console.log(`   • Taille originale: ${Math.round(originalSize / 1024 / 1024)}MB`);
    console.log(`   • Taille optimisée: ${Math.round(optimizedSize / 1024 / 1024)}MB`);
    console.log(`   • Compression: ${compression}%`);
    console.log('📁 Fichier optimisé:', optimizedVideo);

  } catch (error) {
    console.error('❌ Erreur lors de l\'optimisation:', error.message);
    process.exit(1);
  }
}

// Exécuter seulement si ce script est appelé directement
if (import.meta.url === `file://${process.argv[1]}`) {
  optimizeVideo();
}

export { optimizeVideo };