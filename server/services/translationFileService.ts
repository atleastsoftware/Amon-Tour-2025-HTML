import fs from 'fs/promises';
import path from 'path';

export interface TranslationUpdate {
  section: string;
  key: string;
  translations: {
    [language: string]: string;
  };
}

class TranslationFileService {
  private readonly localesDir = path.join(process.cwd(), 'client', 'src', 'locales');
  private readonly supportedLanguages = ['en', 'fr', 'es'];

  async readTranslationFile(language: string): Promise<any> {
    try {
      const filePath = path.join(this.localesDir, `${language}.json`);
      const content = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      console.error(`Error reading ${language}.json:`, error);
      return {};
    }
  }

  async writeTranslationFile(language: string, data: any): Promise<void> {
    try {
      const filePath = path.join(this.localesDir, `${language}.json`);
      await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
      console.log(`✅ Updated ${language}.json`);
    } catch (error) {
      console.error(`Error writing ${language}.json:`, error);
      throw error;
    }
  }

  async updateTranslations(update: TranslationUpdate): Promise<void> {
    console.log(`📝 Updating translations for ${update.section}.${update.key}`);

    for (const language of this.supportedLanguages) {
      try {
        const translations = await this.readTranslationFile(language);
        
        if (!translations[update.section]) {
          translations[update.section] = {};
        }
        
        translations[update.section][update.key] = update.translations[language];
        
        await this.writeTranslationFile(language, translations);
      } catch (error) {
        console.error(`Failed to update ${language}.json:`, error);
      }
    }

    console.log(`✅ All translation files updated for ${update.section}.${update.key}`);
  }

  async batchUpdateTranslations(updates: TranslationUpdate[]): Promise<void> {
    console.log(`📦 Batch updating ${updates.length} translations`);

    const fileData: { [language: string]: any } = {};
    
    for (const language of this.supportedLanguages) {
      fileData[language] = await this.readTranslationFile(language);
    }

    for (const update of updates) {
      for (const language of this.supportedLanguages) {
        if (!fileData[language][update.section]) {
          fileData[language][update.section] = {};
        }
        fileData[language][update.section][update.key] = update.translations[language];
      }
    }

    for (const language of this.supportedLanguages) {
      await this.writeTranslationFile(language, fileData[language]);
    }

    console.log(`✅ Batch update complete: ${updates.length} translations updated`);
  }

  async getTranslationValue(section: string, key: string, language: string = 'en'): Promise<string | undefined> {
    const translations = await this.readTranslationFile(language);
    return translations[section]?.[key];
  }

  async translationExists(section: string, key: string): Promise<boolean> {
    for (const language of this.supportedLanguages.filter(l => l !== 'en')) {
      const value = await this.getTranslationValue(section, key, language);
      if (!value || value === null || value === undefined || value.trim() === '') {
        return false;
      }
    }
    return true;
  }

  async getSection(language: string, section: string): Promise<any> {
    const translations = await this.readTranslationFile(language);
    return translations[section] || {};
  }
}

export const translationFileService = new TranslationFileService();
