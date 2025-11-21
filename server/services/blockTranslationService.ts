import { getTranslatableFields } from '../config/translatableBlockFields';
import { autoTranslationService } from './autoTranslationService';
import { translationFileService } from './translationFileService';

interface BlockConfig {
  [key: string]: any;
}

export class BlockTranslationService {
  async translateBlockChanges(
    blockType: string,
    blockId: number,
    identifier: string | null,
    oldConfig: BlockConfig,
    newConfig: BlockConfig
  ): Promise<void> {
    const translatableConfig = getTranslatableFields(blockType);
    
    if (!translatableConfig.simpleFields && !translatableConfig.arrayFields) {
      console.log(`No translatable fields defined for block type: ${blockType}`);
      return;
    }

    const section = this.getSectionFromBlockId(blockType, blockId);
    
    // Translate simple text fields
    if (translatableConfig.simpleFields) {
      await this.translateSimpleFields(
        translatableConfig.simpleFields,
        oldConfig,
        newConfig,
        section
      );
    }
    
    // Translate array fields (buttons, sections, items, etc.)
    if (translatableConfig.arrayFields) {
      await this.translateArrayFields(
        translatableConfig.arrayFields,
        oldConfig,
        newConfig,
        section
      );
    }
  }

  private async translateSimpleFields(
    fields: string[],
    oldConfig: BlockConfig,
    newConfig: BlockConfig,
    section: string
  ): Promise<void> {
    for (const fieldName of fields) {
      const oldValue = typeof oldConfig[fieldName] === 'string' ? oldConfig[fieldName] : undefined;
      const newValue = typeof newConfig[fieldName] === 'string' ? newConfig[fieldName] : '';
      
      if (!newValue) continue;
      
      // Check if field changed OR if it exists but was never translated
      const translationKey = this.mapFieldNameToTranslationKey(fieldName);
      const hasChanged = await autoTranslationService.detectTextChange(oldValue, newValue);
      const needsTranslation = hasChanged || !(await translationFileService.translationExists(section, translationKey));
      
      if (needsTranslation) {
        console.log(`🔄 Translating ${section}.${translationKey}...`);
        
        try {
          const translations = await autoTranslationService.translateToAllLanguages(newValue, 'en');
          
          await translationFileService.updateTranslations({
            section,
            key: translationKey,
            translations
          });
          
          console.log(`✅ ${section}.${translationKey} translations updated`);
        } catch (error) {
          console.error(`⚠️ ${section}.${translationKey} translation failed:`, error);
        }
      }
    }
  }

  private async translateArrayFields(
    arrayConfigs: Array<{ arrayKey: string; textFields: string[] }>,
    oldConfig: BlockConfig,
    newConfig: BlockConfig,
    section: string
  ): Promise<void> {
    for (const arrayConfig of arrayConfigs) {
      const { arrayKey, textFields } = arrayConfig;
      const newArray = Array.isArray(newConfig[arrayKey]) ? newConfig[arrayKey] : [];
      const oldArray = Array.isArray(oldConfig[arrayKey]) ? oldConfig[arrayKey] : [];
      
      for (let i = 0; i < newArray.length; i++) {
        const newItem = newArray[i];
        const oldItem = oldArray[i];
        
        for (const fieldName of textFields) {
          const oldValue = oldItem?.[fieldName];
          const newValue = newItem?.[fieldName];
          
          if (!newValue || typeof newValue !== 'string') continue;
          
          const hasChanged = await autoTranslationService.detectTextChange(oldValue, newValue);
          const translationKey = `${this.camelToSnakeCase(arrayKey)}_${i}_${this.camelToSnakeCase(fieldName)}`;
          const needsTranslation = hasChanged || !(await translationFileService.translationExists(section, translationKey));
          
          if (needsTranslation) {
            console.log(`🔄 Translating ${section}.${translationKey}...`);
            
            try {
              const translations = await autoTranslationService.translateToAllLanguages(newValue, 'en');
              
              await translationFileService.updateTranslations({
                section,
                key: translationKey,
                translations
              });
              
              console.log(`✅ ${section}.${translationKey} translations updated`);
            } catch (error) {
              console.error(`⚠️ ${section}.${translationKey} translation failed:`, error);
            }
          }
        }
        
        // Handle nested miniIcons for iconBlocks (features_3col, why_choose_us)
        if (arrayKey === 'iconBlocks' && Array.isArray(newItem.miniIcons)) {
          const oldMiniIcons = Array.isArray(oldItem?.miniIcons) ? oldItem.miniIcons : [];
          
          for (let j = 0; j < newItem.miniIcons.length; j++) {
            const newMiniIcon = newItem.miniIcons[j];
            const oldMiniIcon = oldMiniIcons[j];
            
            if (newMiniIcon?.text && typeof newMiniIcon.text === 'string') {
              const oldMiniText = oldMiniIcon?.text;
              const newMiniText = newMiniIcon.text;
              
              const hasChanged = await autoTranslationService.detectTextChange(oldMiniText, newMiniText);
              const translationKey = `icon_blocks_${i}_mini_icons_${j}_text`;
              const needsTranslation = hasChanged || !(await translationFileService.translationExists(section, translationKey));
              
              if (needsTranslation) {
                console.log(`🔄 Translating ${section}.${translationKey}...`);
                
                try {
                  const translations = await autoTranslationService.translateToAllLanguages(newMiniText, 'en');
                  
                  await translationFileService.updateTranslations({
                    section,
                    key: translationKey,
                    translations
                  });
                  
                  console.log(`✅ ${section}.${translationKey} translations updated`);
                } catch (error) {
                  console.error(`⚠️ ${section}.${translationKey} translation failed:`, error);
                }
              }
            }
          }
        }
      }
    }
  }

  private getSectionFromBlockId(blockType: string, blockId: number): string {
    // Create a unique section identifier using blockType and blockId
    // This ensures each block instance has its own translation section
    // Examples: "text_435", "hero_199", "who_we_are_301"
    return `${blockType}_${blockId}`;
  }

  private camelToSnakeCase(str: string): string {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
  }

  private mapFieldNameToTranslationKey(fieldName: string): string {
    // Map database field names to JSON translation keys
    const fieldMappings: Record<string, string> = {
      'content': 'description',      // content field maps to description in JSON
      'titleAccentText': 'title_accent', // camelCase to snake_case
    };
    
    return fieldMappings[fieldName] || this.camelToSnakeCase(fieldName);
  }

  /**
   * Extract ALL translatable fields from a block (for the translation editor)
   * Returns all fields with their English values from the block's content/configuration
   */
  extractAllTranslatableFields(blockType: string, blockContent: any): Record<string, string> {
    const translatableConfig = getTranslatableFields(blockType);
    const extractedFields: Record<string, string> = {};
    
    if (!translatableConfig.simpleFields && !translatableConfig.arrayFields) {
      return extractedFields;
    }

    // Extract simple text fields
    if (translatableConfig.simpleFields) {
      for (const fieldName of translatableConfig.simpleFields) {
        const value = blockContent?.[fieldName];
        if (typeof value === 'string' && value.trim()) {
          const translationKey = this.mapFieldNameToTranslationKey(fieldName);
          extractedFields[translationKey] = value;
        }
      }
    }
    
    // Extract array fields (buttons, sections, items, etc.)
    if (translatableConfig.arrayFields) {
      for (const arrayConfig of translatableConfig.arrayFields) {
        const { arrayKey, textFields } = arrayConfig;
        const array = Array.isArray(blockContent?.[arrayKey]) ? blockContent[arrayKey] : [];
        
        for (let i = 0; i < array.length; i++) {
          const item = array[i];
          
          for (const fieldName of textFields) {
            const value = item?.[fieldName];
            if (typeof value === 'string' && value.trim()) {
              const translationKey = `${this.camelToSnakeCase(arrayKey)}_${i}_${this.camelToSnakeCase(fieldName)}`;
              extractedFields[translationKey] = value;
            }
          }
          
          // Special handling for nested miniIcons in iconBlocks (for features_3col, why_choose_us)
          if (arrayKey === 'iconBlocks' && Array.isArray(item.miniIcons)) {
            for (let j = 0; j < item.miniIcons.length; j++) {
              const miniIcon = item.miniIcons[j];
              if (typeof miniIcon.text === 'string' && miniIcon.text.trim()) {
                const translationKey = `icon_blocks_${i}_mini_icons_${j}_text`;
                extractedFields[translationKey] = miniIcon.text;
              }
            }
          }
        }
      }
    }

    return extractedFields;
  }
}

export const blockTranslationService = new BlockTranslationService();
