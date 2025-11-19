import fetch from 'node-fetch';

export interface TranslationResult {
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
}

export interface BatchTranslationResult {
  [language: string]: string;
}

class AutoTranslationService {
  private readonly apiUrl = 'https://libretranslate.com/translate';
  private readonly supportedLanguages = ['en', 'fr', 'es'];
  
  async translateText(
    text: string,
    targetLanguage: string,
    sourceLanguage: string = 'en'
  ): Promise<TranslationResult> {
    try {
      // CRITICAL: LibreTranslate cannot handle newlines in text (causes 400 error)
      // Solution: Replace newlines with a unique marker, translate, then restore
      const NEWLINE_MARKER = '[[NEWLINE_PLACEHOLDER]]';
      const hasNewlines = text.includes('\n');
      
      // Clean text: replace special characters that might cause issues
      let cleanText = text
        .replace(/–/g, '-')  // Replace em dash with regular dash
        .replace(/—/g, '-')  // Replace en dash with regular dash
        .trim();
      
      // Replace newlines with marker for translation
      if (hasNewlines) {
        cleanText = cleanText.replace(/\n/g, NEWLINE_MARKER);
      }
      
      console.log(`🌍 Translating from ${sourceLanguage} to ${targetLanguage}: "${cleanText.substring(0, 50)}..."`);
      
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: cleanText,
          source: sourceLanguage,
          target: targetLanguage,
          format: 'text'
        })
      });

      if (!response.ok) {
        throw new Error(`LibreTranslate API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json() as { translatedText: string };
      
      // Restore newlines in translated text
      let translatedText = data.translatedText;
      if (hasNewlines) {
        translatedText = translatedText.replace(new RegExp(NEWLINE_MARKER, 'g'), '\n');
      }
      
      console.log(`✅ Translation successful: "${translatedText.substring(0, 50)}..."`);
      
      return {
        translatedText,
        sourceLanguage,
        targetLanguage
      };
    } catch (error) {
      console.error('❌ Translation error:', error);
      throw new Error(`Translation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async translateToAllLanguages(
    text: string,
    sourceLanguage: string = 'en'
  ): Promise<BatchTranslationResult> {
    const results: BatchTranslationResult = {
      [sourceLanguage]: text // Include source text
    };

    const targetLanguages = this.supportedLanguages.filter(lang => lang !== sourceLanguage);
    
    console.log(`🔄 Translating to ${targetLanguages.length} languages: ${targetLanguages.join(', ')}`);

    for (const targetLang of targetLanguages) {
      try {
        const result = await this.translateText(text, targetLang, sourceLanguage);
        results[targetLang] = result.translatedText;
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`Failed to translate to ${targetLang}:`, error);
        results[targetLang] = text; // Fallback to original text
      }
    }

    return results;
  }

  async detectTextChange(oldText: string | undefined, newText: string): Promise<boolean> {
    if (!oldText) return true; // New text, needs translation
    if (oldText === newText) return false; // No change
    
    const normalizedOld = oldText.trim().toLowerCase();
    const normalizedNew = newText.trim().toLowerCase();
    
    return normalizedOld !== normalizedNew;
  }
}

export const autoTranslationService = new AutoTranslationService();
