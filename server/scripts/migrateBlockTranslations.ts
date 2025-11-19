import { db } from '../db';
import { pageBlocks } from '../../shared/schema';
import { blockTranslationService } from '../services/blockTranslationService';

/**
 * Migration script to generate initial translations for all existing blocks
 * This ensures that all blocks have their unique translation sections (e.g., text_435, hero_199)
 */
async function migrateBlockTranslations() {
  console.log('🚀 Starting block translation migration...\n');
  
  try {
    // Get all blocks from the database
    const blocks = await db.select().from(pageBlocks);
    console.log(`📦 Found ${blocks.length} blocks to process\n`);
    
    let processedCount = 0;
    let skippedCount = 0;
    
    for (const block of blocks) {
      const blockConfig = block.configuration || {};
      
      // Check if block has any translatable content
      const hasContent = 
        block.title || 
        block.subtitle || 
        block.content || 
        blockConfig.title ||
        blockConfig.subtitle ||
        blockConfig.description;
      
      if (!hasContent) {
        console.log(`⏭️  Skipping block ${block.id} (${block.blockType}) - no translatable content`);
        skippedCount++;
        continue;
      }
      
      console.log(`🔄 Processing block ${block.id} (${block.blockType})...`);
      
      try {
        // Trigger translation by comparing empty old config with current config
        await blockTranslationService.translateBlockChanges(
          block.blockType,
          block.id,
          block.identifier,
          {}, // Empty old config to force translation of all fields
          blockConfig
        );
        
        processedCount++;
        console.log(`✅ Block ${block.id} (${block.blockType}) translated successfully\n`);
      } catch (error) {
        console.error(`❌ Failed to translate block ${block.id}:`, error);
      }
    }
    
    console.log('\n📊 Migration Summary:');
    console.log(`   ✅ Successfully processed: ${processedCount}`);
    console.log(`   ⏭️  Skipped (no content): ${skippedCount}`);
    console.log(`   📝 Total blocks: ${blocks.length}`);
    console.log('\n✨ Migration completed!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

// Run migration
migrateBlockTranslations()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
