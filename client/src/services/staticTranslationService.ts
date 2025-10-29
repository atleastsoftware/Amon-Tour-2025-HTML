// Static Translation Service - Loads translations from local JSON files
// This replaces expensive Google API calls with instant local translations

import enTranslations from '../locales/en.json';
import frTranslations from '../locales/fr.json';
import esTranslations from '../locales/es.json';

export interface TranslationCache {
  [langCode: string]: any;
}

class StaticTranslationService {
  private translations: TranslationCache = {
    en: enTranslations,
    fr: frTranslations,
    es: esTranslations
  };

  private currentLanguage: string = 'en';
  private dynamicTranslationCache = new Map<string, Map<string, string>>();

  constructor() {
    // Load saved language preference
    const savedLang = localStorage.getItem('preferred-language');
    if (savedLang && this.translations[savedLang]) {
      this.currentLanguage = savedLang;
    }
  }

  /**
   * Get all translations for a language
   */
  getTranslations(language?: string): any {
    const lang = language || this.currentLanguage;
    return this.translations[lang] || this.translations.en;
  }

  /**
   * Set the current language
   */
  setLanguage(language: string): boolean {
    if (this.translations[language]) {
      this.currentLanguage = language;
      localStorage.setItem('preferred-language', language);
      document.documentElement.lang = language;
      return true;
    }
    return false;
  }

  /**
   * Get current language
   */
  getCurrentLanguage(): string {
    return this.currentLanguage;
  }

  /**
   * Translate a specific key path
   */
  translate(keyPath: string, language?: string): string {
    const lang = language || this.currentLanguage;
    const translations = this.getTranslations(lang);
    
    const keys = keyPath.split('.');
    let value: any = translations;
    
    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        // Return the key if translation not found
        return keyPath;
      }
    }
    
    return typeof value === 'string' ? value : keyPath;
  }

  /**
   * Check if a translation needs dynamic fetching (not in static files)
   * This is for future dynamic content like tour descriptions from database
   */
  isDynamicContent(content: string): boolean {
    // Tour descriptions, blog posts, and other database content
    // should be marked as dynamic
    return content.length > 200 || content.includes('Tour ID:');
  }

  /**
   * Add a dynamic translation to cache (for content from database)
   */
  addDynamicTranslation(text: string, translation: string, language: string): void {
    if (!this.dynamicTranslationCache.has(language)) {
      this.dynamicTranslationCache.set(language, new Map());
    }
    
    const langCache = this.dynamicTranslationCache.get(language)!;
    langCache.set(text, translation);
    
    // Save to localStorage for persistence
    this.saveDynamicCache();
  }

  /**
   * Get a dynamic translation from cache
   */
  getDynamicTranslation(text: string, language: string): string | null {
    const langCache = this.dynamicTranslationCache.get(language);
    return langCache?.get(text) || null;
  }

  /**
   * Save dynamic translations to localStorage
   */
  private saveDynamicCache(): void {
    try {
      const cacheObj: any = {};
      this.dynamicTranslationCache.forEach((langMap, lang) => {
        cacheObj[lang] = Array.from(langMap.entries());
      });
      localStorage.setItem('dynamicTranslations', JSON.stringify(cacheObj));
    } catch (error) {
      console.error('Failed to save dynamic translations:', error);
    }
  }

  /**
   * Load dynamic translations from localStorage
   */
  loadDynamicCache(): void {
    try {
      const stored = localStorage.getItem('dynamicTranslations');
      if (stored) {
        const cacheObj = JSON.parse(stored);
        Object.entries(cacheObj).forEach(([lang, entries]) => {
          const langMap = new Map(entries as [string, string][]);
          this.dynamicTranslationCache.set(lang, langMap);
        });
      }
    } catch (error) {
      console.error('Failed to load dynamic translations:', error);
    }
  }

  /**
   * Get supported languages
   */
  getSupportedLanguages(): string[] {
    return Object.keys(this.translations);
  }

  /**
   * Check if a language is supported
   */
  isLanguageSupported(language: string): boolean {
    return language in this.translations;
  }

  /**
   * Clear all caches (useful for testing)
   */
  clearCache(): void {
    this.dynamicTranslationCache.clear();
    localStorage.removeItem('dynamicTranslations');
    console.log('✅ Translation caches cleared');
  }
}

// Export singleton instance
export const staticTranslationService = new StaticTranslationService();