import fs from 'fs';
import path from 'path';
import { neon } from '@neondatabase/serverless';

// Configuration Object Storage
const PRIVATE_OBJECT_DIR = process.env.PRIVATE_OBJECT_DIR;
if (!PRIVATE_OBJECT_DIR) {
  console.error('❌ PRIVATE_OBJECT_DIR not set. Object Storage not configured.');
  process.exit(1);
}

const bucketId = PRIVATE_OBJECT_DIR.split('/')[1];
const objectStorageDir = path.join(PRIVATE_OBJECT_DIR, 'tour-images');

// Créer le dossier Object Storage si nécessaire
if (!fs.existsSync(objectStorageDir)) {
  fs.mkdirSync(objectStorageDir, { recursive: true });
  console.log('✅ Created Object Storage directory:', objectStorageDir);
}

// Fonction pour copier une image vers Object Storage
function migrateImage(localPath, tourNinjaId) {
  try {
    const fileName = path.basename(localPath);
    
    // Générer nouveau nom avec l'ID Tour Ninja
    const extension = path.extname(fileName);
    const timestamp = Date.now();
    const newFileName = `tour-ninja-${tourNinjaId}-${timestamp}${extension}`;
    
    // Chemin source
    const sourcePath = path.join(process.cwd(), localPath.replace(/^\//, ''));
    
    // Vérifier si le fichier existe
    if (!fs.existsSync(sourcePath)) {
      console.log(`⚠️ File not found locally: ${sourcePath}`);
      return null;
    }
    
    // Chemin destination dans Object Storage
    const destPath = path.join(objectStorageDir, newFileName);
    
    // Copier le fichier
    fs.copyFileSync(sourcePath, destPath);
    
    // Nouvelle URL persistante
    const newUrl = `/${bucketId}/.private/tour-images/${newFileName}`;
    
    console.log(`✅ Migrated ${localPath} → ${newUrl}`);
    return newUrl;
  } catch (error) {
    console.error(`❌ Failed to migrate ${localPath}:`, error.message);
    return null;
  }
}

// Fonction principale
async function main() {
  const sql = neon(process.env.DATABASE_URL);
  
  try {
    // Récupérer toutes les images de la base de données
    const rows = await sql`
      SELECT id, tour_ninja_id, tour_name, custom_image_url 
      FROM tour_ninja_image_overrides
      WHERE custom_image_url IS NOT NULL
    `;
    
    console.log(`\n📦 Migration de ${rows.length} images vers Object Storage...\n`);
    
    let migrated = 0;
    let failed = 0;
    
    for (const row of rows) {
      const { id, tour_ninja_id, tour_name, custom_image_url } = row;
      
      // Si déjà dans Object Storage, ignorer
      if (custom_image_url.includes(bucketId)) {
        console.log(`✓ Already in Object Storage: ${tour_name}`);
        continue;
      }
      
      console.log(`\nMigrating image for: ${tour_name}`);
      console.log(`Current URL: ${custom_image_url}`);
      
      // Migrer l'image
      const newUrl = migrateImage(custom_image_url, tour_ninja_id);
      
      if (newUrl) {
        // Mettre à jour la base de données
        await sql`
          UPDATE tour_ninja_image_overrides 
          SET custom_image_url = ${newUrl}
          WHERE id = ${id}
        `;
        
        console.log(`✅ Database updated for ${tour_name}`);
        migrated++;
      } else {
        console.log(`❌ Migration failed for ${tour_name}`);
        failed++;
      }
    }
    
    console.log(`\n✅ Migration terminée!`);
    console.log(`   - ${migrated} images migrées avec succès`);
    console.log(`   - ${failed} échecs`);
    console.log(`   - Images sauvegardées dans: ${objectStorageDir}`);
    
  } catch (error) {
    console.error('❌ Migration error:', error);
    process.exit(1);
  }
}

// Exécuter la migration
main().catch(console.error);