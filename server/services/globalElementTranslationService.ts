import { 
  getTranslatableFooterConfig,
  TRANSLATABLE_NAVIGATION_MENU_FIELDS,
  TRANSLATABLE_ANNOUNCEMENT_BAR_FIELDS,
  TRANSLATABLE_POPUP_FIELDS
} from '../config/translatableGlobalElements';
import { translationFileService } from './translationFileService';
import { autoTranslationService } from './autoTranslationService';

/**
 * Service for managing automatic translations of global site elements
 * (Footer, Navigation Menu, Announcement Bar, Pop-up)
 */
class GlobalElementTranslationService {
  
  /**
   * Synchronize footer section translations
   */
  async syncFooterTranslations(footerSection: string, oldValue: any, newValue: any): Promise<void> {
    const config = getTranslatableFooterConfig(footerSection);
    if (!config) {
      console.log(`⚠️  No translation config for footer section: ${footerSection}`);
      return;
    }

    const section = `footer_${footerSection}`;
    console.log(`🔍 Config for ${section}:`, { hasArrayFields: !!config.arrayFields, hasSimpleFields: !!config.simpleFields });
    
    // Handle array fields (contact_info, useful_links, social_media)
    if (config.arrayFields) {
      console.log(`📋 Processing array fields for ${section}, newValue length:`, Array.isArray(newValue) ? newValue.length : 'not an array');
      await this.translateArrayFields(
        section,
        config.arrayFields.textFields,
        oldValue || [],
        newValue || []
      );
    }
    
    // Handle simple fields (newsletter_config, copyright_config)
    if (config.simpleFields) {
      console.log(`📋 Processing simple fields for ${section}:`, config.simpleFields);
      await this.translateSimpleFields(
        section,
        config.simpleFields,
        oldValue || {},
        newValue || {}
      );
    }
  }

  /**
   * Synchronize navigation menu item translations
   */
  async syncNavigationMenuTranslations(itemId: number, oldItem: any, newItem: any): Promise<void> {
    const section = `navigation_menu_${itemId}`;
    const textFields = TRANSLATABLE_NAVIGATION_MENU_FIELDS.textFields;
    
    for (const fieldName of textFields) {
      const oldFieldValue = oldItem?.[fieldName];
      const newFieldValue = newItem?.[fieldName];
      
      if (!newFieldValue || typeof newFieldValue !== 'string') continue;
      
      const hasChanged = await autoTranslationService.detectTextChange(oldFieldValue, newFieldValue);
      const translationKey = this.camelToSnakeCase(fieldName);
      const needsTranslation = hasChanged || !(await translationFileService.translationExists(section, translationKey));
      
      if (needsTranslation) {
        await this.translateField(section, translationKey, newFieldValue);
      }
    }
  }

  /**
   * Synchronize announcement bar translations
   */
  async syncAnnouncementBarTranslations(oldSettings: any, newSettings: any): Promise<void> {
    const section = 'announcement_bar';
    const simpleFields = TRANSLATABLE_ANNOUNCEMENT_BAR_FIELDS.simpleFields || [];
    
    await this.translateSimpleFields(section, simpleFields, oldSettings || {}, newSettings || {});
  }

  /**
   * Synchronize pop-up translations
   */
  async syncPopupTranslations(oldSettings: any, newSettings: any): Promise<void> {
    const section = 'popup';
    const simpleFields = TRANSLATABLE_POPUP_FIELDS.simpleFields || [];
    
    await this.translateSimpleFields(section, simpleFields, oldSettings || {}, newSettings || {});
  }

  /**
   * Translate array fields (for footer sections)
   */
  private async translateArrayFields(
    section: string,
    textFields: string[],
    oldArray: any[],
    newArray: any[]
  ): Promise<void> {
    for (let i = 0; i < newArray.length; i++) {
      const newItem = newArray[i];
      const oldItem = oldArray[i];
      
      for (const fieldName of textFields) {
        const oldValue = oldItem?.[fieldName];
        const newValue = newItem?.[fieldName];
        
        if (!newValue || typeof newValue !== 'string') continue;
        
        const hasChanged = await autoTranslationService.detectTextChange(oldValue, newValue);
        const translationKey = `item_${i}_${this.camelToSnakeCase(fieldName)}`;
        const needsTranslation = hasChanged || !(await translationFileService.translationExists(section, translationKey));
        
        if (needsTranslation) {
          await this.translateField(section, translationKey, newValue);
        }
      }
    }
  }

  /**
   * Translate simple fields (for newsletter, copyright, announcement bar, pop-up)
   */
  private async translateSimpleFields(
    section: string,
    simpleFields: string[],
    oldConfig: any,
    newConfig: any
  ): Promise<void> {
    for (const fieldName of simpleFields) {
      const oldValue = oldConfig?.[fieldName];
      const newValue = newConfig?.[fieldName];
      
      if (!newValue || typeof newValue !== 'string') continue;
      
      const hasChanged = await autoTranslationService.detectTextChange(oldValue, newValue);
      const translationKey = this.camelToSnakeCase(fieldName);
      const needsTranslation = hasChanged || !(await translationFileService.translationExists(section, translationKey));
      
      if (needsTranslation) {
        await this.translateField(section, translationKey, newValue);
      }
    }
  }

  /**
   * Translate a single field and update translation files
   */
  private async translateField(section: string, translationKey: string, englishValue: string): Promise<void> {
    // Check if manually edited
    const frManuallyEdited = await translationFileService.isManuallyEdited(section, translationKey, 'fr');
    const esManuallyEdited = await translationFileService.isManuallyEdited(section, translationKey, 'es');
    
    if (frManuallyEdited || esManuallyEdited) {
      console.log(`⚠️  ${section}.${translationKey} has manual edits - preserving them`);
    }
    
    console.log(`📝 Creating translation keys for ${section}.${translationKey}...`);
    
    try {
      // Get existing translations if they exist
      const existingFr = await translationFileService.getTranslationValue(section, translationKey, 'fr');
      const existingEs = await translationFileService.getTranslationValue(section, translationKey, 'es');
      
      // Create translations (use English text for now if no translation exists)
      const finalTranslations: any = { 
        en: englishValue,
        fr: frManuallyEdited && existingFr ? existingFr : englishValue,
        es: esManuallyEdited && existingEs ? existingEs : englishValue
      };
      
      await translationFileService.updateTranslations({
        section,
        key: translationKey,
        translations: finalTranslations,
        isManualEdit: false
      });
      
      console.log(`✅ ${section}.${translationKey} translation keys created`);
    } catch (error) {
      console.error(`⚠️  ${section}.${translationKey} key creation failed:`, error);
    }
  }

  /**
   * Extract all translatable fields from footer section
   */
  extractFooterTranslatableFields(footerSection: string, footerContent: any): Record<string, string> {
    const config = getTranslatableFooterConfig(footerSection);
    const extractedFields: Record<string, string> = {};
    
    if (!config) return extractedFields;
    
    // Handle array fields
    if (config.arrayFields && Array.isArray(footerContent)) {
      for (let i = 0; i < footerContent.length; i++) {
        const item = footerContent[i];
        for (const fieldName of config.arrayFields.textFields) {
          const value = item?.[fieldName];
          if (typeof value === 'string' && value.trim()) {
            const translationKey = `item_${i}_${this.camelToSnakeCase(fieldName)}`;
            extractedFields[translationKey] = value;
          }
        }
      }
    }
    
    // Handle simple fields
    if (config.simpleFields) {
      for (const fieldName of config.simpleFields) {
        const value = footerContent?.[fieldName];
        if (typeof value === 'string' && value.trim()) {
          const translationKey = this.camelToSnakeCase(fieldName);
          extractedFields[translationKey] = value;
        }
      }
    }
    
    return extractedFields;
  }

  /**
   * Extract translatable fields from navigation menu item
   */
  extractNavigationMenuTranslatableFields(menuItem: any): Record<string, string> {
    const extractedFields: Record<string, string> = {};
    const textFields = TRANSLATABLE_NAVIGATION_MENU_FIELDS.textFields;
    
    for (const fieldName of textFields) {
      const value = menuItem?.[fieldName];
      if (typeof value === 'string' && value.trim()) {
        const translationKey = this.camelToSnakeCase(fieldName);
        extractedFields[translationKey] = value;
      }
    }
    
    return extractedFields;
  }

  /**
   * Extract translatable fields from announcement bar
   */
  extractAnnouncementBarTranslatableFields(settings: any): Record<string, string> {
    const extractedFields: Record<string, string> = {};
    const simpleFields = TRANSLATABLE_ANNOUNCEMENT_BAR_FIELDS.simpleFields || [];
    
    for (const fieldName of simpleFields) {
      const value = settings?.[fieldName];
      if (typeof value === 'string' && value.trim()) {
        const translationKey = this.camelToSnakeCase(fieldName);
        extractedFields[translationKey] = value;
      }
    }
    
    return extractedFields;
  }

  /**
   * Extract translatable fields from pop-up
   */
  extractPopupTranslatableFields(settings: any): Record<string, string> {
    const extractedFields: Record<string, string> = {};
    const simpleFields = TRANSLATABLE_POPUP_FIELDS.simpleFields || [];
    
    for (const fieldName of simpleFields) {
      const value = settings?.[fieldName];
      if (typeof value === 'string' && value.trim()) {
        const translationKey = this.camelToSnakeCase(fieldName);
        extractedFields[translationKey] = value;
      }
    }
    
    return extractedFields;
  }

  /**
   * Convert camelCase to snake_case
   */
  private camelToSnakeCase(str: string): string {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
  }
}

export const globalElementTranslationService = new GlobalElementTranslationService();
