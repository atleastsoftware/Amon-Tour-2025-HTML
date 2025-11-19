import { getTranslatableFields } from '../config/translatableBlockFields';
import { autoTranslationService } from './autoTranslationService';
import { translationFileService } from './translationFileService';

interface BlockConfig {
  [key: string]: any;
}

export class BlockTranslationService {
  async translateBlockChanges(
    blockType: string,
    identifier: string | null,
    oldConfig: BlockConfig,
    newConfig: BlockConfig
  ): Promise<void> {
    const translatableConfig = getTranslatableFields(blockType);
    
    if (!translatableConfig.simpleFields && !translatableConfig.arrayFields) {
      console.log(`No translatable fields defined for block type: ${blockType}`);
      return;
    }

    const section = this.getSectionFromIdentifier(identifier, blockType);
    
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
      const hasChanged = await autoTranslationService.detectTextChange(oldValue, newValue);
      const needsTranslation = hasChanged || !(await translationFileService.translationExists(section, this.camelToSnakeCase(fieldName)));
      
      if (needsTranslation) {
        console.log(`🔄 Translating ${section}.${fieldName}...`);
        
        try {
          const translations = await autoTranslationService.translateToAllLanguages(newValue, 'en');
          
          await translationFileService.updateTranslations({
            section,
            key: this.camelToSnakeCase(fieldName),
            translations
          });
          
          console.log(`✅ ${section}.${fieldName} translations updated`);
        } catch (error) {
          console.error(`⚠️ ${section}.${fieldName} translation failed:`, error);
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
      }
    }
  }

  private getSectionFromIdentifier(identifier: string | null, blockType: string): string {
    if (!identifier) return blockType;
    
    // Extract meaningful section name from identifier
    // Examples: "hero_1234" -> "hero", "custom_tour_form_5678" -> "custom_tour_form"
    const parts = identifier.split('_');
    
    // If identifier starts with block type, use it
    if (identifier.startsWith(blockType)) {
      return blockType;
    }
    
    // Otherwise, try to extract meaningful prefix
    if (parts.length > 1) {
      // Remove the timestamp number at the end
      const withoutTimestamp = parts.slice(0, -1).join('_');
      return withoutTimestamp || blockType;
    }
    
    return identifier;
  }

  private camelToSnakeCase(str: string): string {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
  }
}

export const blockTranslationService = new BlockTranslationService();
