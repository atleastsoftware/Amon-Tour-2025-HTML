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
        // Check if manually edited (for logging purposes only)
        const frManuallyEdited = await translationFileService.isManuallyEdited(section, translationKey, 'fr');
        const esManuallyEdited = await translationFileService.isManuallyEdited(section, translationKey, 'es');
        
        if (frManuallyEdited || esManuallyEdited) {
          console.log(`⚠️ ${section}.${translationKey} had manual edits - will be overwritten with new auto-translation`);
        }
        
        console.log(`🔄 Translating ${section}.${translationKey}...`);
        
        try {
          const translations = await autoTranslationService.translateToAllLanguages(newValue, 'en');
          
          // Always update all translations when English text changes
          const finalTranslations: any = { 
            en: newValue,
            fr: translations.fr,
            es: translations.es
          };
          
          await translationFileService.updateTranslations({
            section,
            key: translationKey,
            translations: finalTranslations,
            isManualEdit: false,  // This is automatic translation
            resetManualFlags: {
              fr: true,  // Always reset FR flag since we're auto-translating
              es: true   // Always reset ES flag since we're auto-translating
            }
          });
          
          console.log(`✅ ${section}.${translationKey} translations updated (FR: auto, ES: auto)`);
        } catch (error) {
          console.error(`⚠️ ${section}.${translationKey} translation failed:`, error);
        }
      }
    }
  }

  private async translateArrayFields(
    arrayConfigs: Array<{ arrayKey: string; textFields: string[]; nestedArrays?: Array<{ arrayKey: string; textFields: string[] }> }>,
    oldConfig: BlockConfig,
    newConfig: BlockConfig,
    section: string
  ): Promise<void> {
    for (const arrayConfig of arrayConfigs) {
      const { arrayKey, textFields, nestedArrays } = arrayConfig;
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
            // Check if manually edited (for logging purposes only)
            const frManuallyEdited = await translationFileService.isManuallyEdited(section, translationKey, 'fr');
            const esManuallyEdited = await translationFileService.isManuallyEdited(section, translationKey, 'es');
            
            if (frManuallyEdited || esManuallyEdited) {
              console.log(`⚠️ ${section}.${translationKey} had manual edits - will be overwritten with new auto-translation`);
            }
            
            console.log(`🔄 Translating ${section}.${translationKey}...`);
            
            try {
              const translations = await autoTranslationService.translateToAllLanguages(newValue, 'en');
              
              // Always update all translations when English text changes
              const finalTranslations: any = { 
                en: newValue,
                fr: translations.fr,
                es: translations.es
              };
              
              await translationFileService.updateTranslations({
                section,
                key: translationKey,
                translations: finalTranslations,
                isManualEdit: false,
                resetManualFlags: {
                  fr: true,  // Always reset FR flag since we're auto-translating
                  es: true   // Always reset ES flag since we're auto-translating
                }
              });
              
              console.log(`✅ ${section}.${translationKey} translations updated (FR: auto, ES: auto)`);
            } catch (error) {
              console.error(`⚠️ ${section}.${translationKey} translation failed:`, error);
            }
          }
        }
        
        // Handle nested arrays (e.g., miniIcons inside iconBlocks)
        if (nestedArrays && nestedArrays.length > 0) {
          for (const nestedConfig of nestedArrays) {
            const nestedArrayKey = nestedConfig.arrayKey;
            const nestedTextFields = nestedConfig.textFields;
            
            if (Array.isArray(newItem[nestedArrayKey])) {
              const oldNestedArray = Array.isArray(oldItem?.[nestedArrayKey]) ? oldItem[nestedArrayKey] : [];
              
              for (let j = 0; j < newItem[nestedArrayKey].length; j++) {
                const newNestedItem = newItem[nestedArrayKey][j];
                const oldNestedItem = oldNestedArray[j];
                
                for (const nestedFieldName of nestedTextFields) {
                  const oldNestedValue = oldNestedItem?.[nestedFieldName];
                  const newNestedValue = newNestedItem?.[nestedFieldName];
                  
                  if (!newNestedValue || typeof newNestedValue !== 'string') continue;
                  
                  const hasChanged = await autoTranslationService.detectTextChange(oldNestedValue, newNestedValue);
                  const translationKey = `${this.camelToSnakeCase(arrayKey)}_${i}_${this.camelToSnakeCase(nestedArrayKey)}_${j}_${this.camelToSnakeCase(nestedFieldName)}`;
                  const needsTranslation = hasChanged || !(await translationFileService.translationExists(section, translationKey));
                  
                  if (needsTranslation) {
                    // Check if manually edited (for logging purposes only)
                    const frManuallyEdited = await translationFileService.isManuallyEdited(section, translationKey, 'fr');
                    const esManuallyEdited = await translationFileService.isManuallyEdited(section, translationKey, 'es');
                    
                    if (frManuallyEdited || esManuallyEdited) {
                      console.log(`⚠️ ${section}.${translationKey} had manual edits - will be overwritten with new auto-translation`);
                    }
                    
                    console.log(`🔄 Translating ${section}.${translationKey}...`);
                    
                    try {
                      const translations = await autoTranslationService.translateToAllLanguages(newNestedValue, 'en');
                      
                      // Always update all translations when English text changes
                      const finalTranslations: any = { 
                        en: newNestedValue,
                        fr: translations.fr,
                        es: translations.es
                      };
                      
                      await translationFileService.updateTranslations({
                        section,
                        key: translationKey,
                        translations: finalTranslations,
                        isManualEdit: false,
                        resetManualFlags: {
                          fr: true,  // Always reset FR flag since we're auto-translating
                          es: true   // Always reset ES flag since we're auto-translating
                        }
                      });
                      
                      console.log(`✅ ${section}.${translationKey} translations updated (FR: auto, ES: auto)`);
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
        const { arrayKey, textFields, nestedArrays } = arrayConfig;
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
          
          // Handle nested arrays (e.g., miniIcons in iconBlocks)
          if (nestedArrays && nestedArrays.length > 0) {
            for (const nestedConfig of nestedArrays) {
              const nestedArrayKey = nestedConfig.arrayKey;
              const nestedTextFields = nestedConfig.textFields;
              
              if (Array.isArray(item[nestedArrayKey])) {
                for (let j = 0; j < item[nestedArrayKey].length; j++) {
                  const nestedItem = item[nestedArrayKey][j];
                  
                  for (const nestedFieldName of nestedTextFields) {
                    const nestedValue = nestedItem?.[nestedFieldName];
                    if (typeof nestedValue === 'string' && nestedValue.trim()) {
                      const translationKey = `${this.camelToSnakeCase(arrayKey)}_${i}_${this.camelToSnakeCase(nestedArrayKey)}_${j}_${this.camelToSnakeCase(nestedFieldName)}`;
                      extractedFields[translationKey] = nestedValue;
                    }
                  }
                }
              }
            }
          }
        }
      }
    }

    return extractedFields;
  }

  /**
   * Get all translations for a block from the JSON files
   * Returns translations in database format: { en: {}, fr: {}, es: {} }
   */
  async getBlockTranslationsFromFiles(blockType: string, blockId: number, blockContent: any): Promise<{
    en: Record<string, string>;
    fr: Record<string, string>;
    es: Record<string, string>;
  }> {
    const section = this.getSectionFromBlockId(blockType, blockId);
    const englishFields = this.extractAllTranslatableFields(blockType, blockContent);
    
    const translations = {
      en: englishFields,
      fr: {} as Record<string, string>,
      es: {} as Record<string, string>
    };

    // Read translations from JSON files for each key
    for (const key of Object.keys(englishFields)) {
      try {
        const frValue = await translationFileService.getTranslationValue(section, key, 'fr');
        const esValue = await translationFileService.getTranslationValue(section, key, 'es');
        
        if (frValue) translations.fr[key] = frValue;
        if (esValue) translations.es[key] = esValue;
      } catch (error) {
        console.error(`Error reading translation for ${section}.${key}:`, error);
      }
    }

    return translations;
  }
}

export const blockTranslationService = new BlockTranslationService();
