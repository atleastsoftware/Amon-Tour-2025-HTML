// Google Translate Service - Dynamic translation using Google Translate API

interface TranslationCache {
  [key: string]: {
    translation: string;
    timestamp: number;
  };
}

class GoogleTranslateService {
  private cache: Map<string, TranslationCache> = new Map();
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
  private readonly BATCH_SIZE = 100; // Google Translate API limit

  constructor() {
    // Load cache from localStorage on initialization
    this.loadCache();
  }

  // Load cache from localStorage
  private loadCache(): void {
    try {
      const stored = localStorage.getItem('translationCache');
      if (stored) {
        const parsed = JSON.parse(stored);
        Object.entries(parsed).forEach(([lang, translations]) => {
          this.cache.set(lang, translations as TranslationCache);
        });
      }
    } catch (error) {
      console.error('Failed to load translation cache:', error);
    }
  }

  // Save cache to localStorage
  private saveCache(): void {
    try {
      const cacheObject: { [key: string]: TranslationCache } = {};
      this.cache.forEach((value, key) => {
        cacheObject[key] = value;
      });
      localStorage.setItem('translationCache', JSON.stringify(cacheObject));
    } catch (error) {
      console.error('Failed to save translation cache:', error);
    }
  }

  // Get cache key for a text
  private getCacheKey(text: string): string {
    return text.trim().toLowerCase();
  }

  // Check if cached translation is still valid
  private isCacheValid(timestamp: number): boolean {
    return Date.now() - timestamp < this.CACHE_DURATION;
  }

  // Get cached translation
  private getCachedTranslation(text: string, targetLanguage: string): string | null {
    const langCache = this.cache.get(targetLanguage);
    if (!langCache) return null;

    const key = this.getCacheKey(text);
    const cached = langCache[key];
    
    if (cached && this.isCacheValid(cached.timestamp)) {
      return cached.translation;
    }
    
    return null;
  }

  // Set cached translation
  private setCachedTranslation(text: string, translation: string, targetLanguage: string): void {
    if (!this.cache.has(targetLanguage)) {
      this.cache.set(targetLanguage, {});
    }
    
    const langCache = this.cache.get(targetLanguage)!;
    const key = this.getCacheKey(text);
    
    langCache[key] = {
      translation,
      timestamp: Date.now()
    };
    
    this.saveCache();
  }

  // Translate single text
  async translateText(text: string, targetLanguage: string, sourceLanguage: string = 'auto'): Promise<string> {
    // Return original text if translating to same language
    if (sourceLanguage === targetLanguage) {
      return text;
    }

    // Check cache first
    const cached = this.getCachedTranslation(text, targetLanguage);
    if (cached) {
      return cached;
    }

    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          targetLanguage,
          sourceLanguage
        })
      });

      if (!response.ok) {
        throw new Error(`Translation API error: ${response.status}`);
      }

      const data = await response.json();
      const translation = data.translation || text;
      
      // Cache the translation
      this.setCachedTranslation(text, translation, targetLanguage);
      
      return translation;
    } catch (error) {
      console.error('Translation error:', error);
      return text; // Return original text as fallback
    }
  }

  // Translate multiple texts in batch
  async translateBatch(texts: string[], targetLanguage: string, sourceLanguage: string = 'auto'): Promise<{ [key: string]: string }> {
    const results: { [key: string]: string } = {};
    
    console.log(`🔄 translateBatch called with ${texts.length} texts to ${targetLanguage}`);
    
    // Return original texts if translating to same language
    if (sourceLanguage === targetLanguage) {
      texts.forEach(text => {
        results[text] = text;
      });
      return results;
    }

    // Check cache and separate cached from non-cached
    const textsToTranslate: string[] = [];
    
    for (const text of texts) {
      const cached = this.getCachedTranslation(text, targetLanguage);
      if (cached) {
        results[text] = cached;
      } else {
        textsToTranslate.push(text);
      }
    }
    
    console.log(`📊 Cache status: ${texts.length - textsToTranslate.length} cached, ${textsToTranslate.length} need translation`);

    // If all texts were cached, return immediately
    if (textsToTranslate.length === 0) {
      console.log('✅ All texts were cached, returning cached results');
      return results;
    }

    // Split into batches if necessary
    const batches: string[][] = [];
    for (let i = 0; i < textsToTranslate.length; i += this.BATCH_SIZE) {
      batches.push(textsToTranslate.slice(i, i + this.BATCH_SIZE));
    }

    // Process each batch
    console.log(`🚀 Making ${batches.length} API call(s) to translate ${textsToTranslate.length} texts`);
    
    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex];
      console.log(`📤 Sending batch ${batchIndex + 1}/${batches.length} with ${batch.length} texts to /api/translate/batch`);
      
      try {
        const requestBody = {
          texts: batch,
          targetLanguage,
          sourceLanguage
        };
        
        console.log('🌐 Making API request to /api/translate/batch');
        
        const response = await fetch('/api/translate/batch', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody)
        });

        console.log(`📥 API Response status: ${response.status}`);

        if (!response.ok) {
          throw new Error(`Translation API error: ${response.status}`);
        }

        const data = await response.json();
        const translations = data.translations || {};
        
        console.log(`✅ Received ${Object.keys(translations).length} translations from API`);
        
        // Process translations and update cache
        Object.entries(translations).forEach(([originalText, translation]) => {
          results[originalText] = translation as string;
          this.setCachedTranslation(originalText, translation as string, targetLanguage);
        });
      } catch (error) {
        console.error('Batch translation error:', error);
        // Add original texts as fallback
        batch.forEach(text => {
          results[text] = text;
        });
      }
    }

    return results;
  }

  // Translate an object with nested strings
  async translateObject(obj: any, targetLanguage: string, sourceLanguage: string = 'auto', bypassCache: boolean = false): Promise<any> {
    console.log('📞 translateObject called with:', {
      targetLanguage,
      sourceLanguage,
      bypassCache,
      objectKeys: Object.keys(obj)
    });
    
    // Clear cache if bypass is requested (useful for testing)
    if (bypassCache) {
      console.log('🗑️ Bypassing cache for testing');
      this.clearCache(targetLanguage);
    }
    
    // Collect all strings from the object
    const strings: string[] = [];
    const paths: string[] = [];

    function collectStrings(o: any, path: string = '') {
      for (const key in o) {
        const newPath = path ? `${path}.${key}` : key;
        const value = o[key];
        
        if (typeof value === 'string') {
          strings.push(value);
          paths.push(newPath);
        } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          collectStrings(value, newPath);
        }
      }
    }

    collectStrings(obj);
    
    console.log(`📊 Found ${strings.length} strings to translate`);

    // Translate all strings in batch
    const translations = await this.translateBatch(strings, targetLanguage, sourceLanguage);

    // Create translated object
    const result = JSON.parse(JSON.stringify(obj)); // Deep clone

    // Apply translations
    strings.forEach((str, index) => {
      const path = paths[index];
      const translation = translations[str] || str;
      
      // Set value at path
      const keys = path.split('.');
      let current = result;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = translation;
    });

    return result;
  }

  // Clear cache for a specific language or all languages
  clearCache(targetLanguage?: string): void {
    if (targetLanguage) {
      this.cache.delete(targetLanguage);
    } else {
      this.cache.clear();
    }
    this.saveCache();
  }

  // Get cache statistics
  getCacheStats(): { totalEntries: number; languages: string[]; sizeInBytes: number } {
    let totalEntries = 0;
    const languages: string[] = [];
    
    this.cache.forEach((langCache, lang) => {
      languages.push(lang);
      totalEntries += Object.keys(langCache).length;
    });

    const sizeInBytes = new Blob([localStorage.getItem('translationCache') || '']).size;

    return {
      totalEntries,
      languages,
      sizeInBytes
    };
  }
}

// Export singleton instance
export const googleTranslateService = new GoogleTranslateService();