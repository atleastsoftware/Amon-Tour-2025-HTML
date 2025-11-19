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
  private readonly apiUrl = 'https://api.mymemory.translated.net/get';
  private readonly supportedLanguages = ['en', 'fr', 'es'];
  
  async translateText(
    text: string,
    targetLanguage: string,
    sourceLanguage: string = 'en'
  ): Promise<TranslationResult> {
    try {
      const hasNewlines = text.includes('\n');
      
      if (hasNewlines) {
        console.log(`🌍 Translating multi-line text from ${sourceLanguage} to ${targetLanguage} (${text.split('\n').length} lines)`);
        
        const lines = text.split('\n');
        const translatedLines: string[] = [];
        
        for (const line of lines) {
          if (!line.trim()) {
            translatedLines.push(line);
            continue;
          }
          
          const cleanLine = line
            .replace(/–/g, '-')
            .replace(/—/g, '-')
            .trim();
          
          console.log(`  📝 Translating line: "${cleanLine}"`);
          
          const encodedText = encodeURIComponent(cleanLine);
          const url = `${this.apiUrl}?q=${encodedText}&langpair=${sourceLanguage}|${targetLanguage}`;
          
          const response = await fetch(url);

          if (!response.ok) {
            throw new Error(`MyMemory API error: ${response.status} ${response.statusText}`);
          }

          const data = await response.json() as any;
          
          if (data.responseStatus !== 200) {
            throw new Error(`MyMemory API error: ${data.responseStatus} - ${data.responseDetails || 'Unknown error'}`);
          }
          
          translatedLines.push(data.responseData.translatedText);
          
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        const translatedText = translatedLines.join('\n');
        console.log(`✅ Multi-line translation complete`);
        
        return {
          translatedText,
          sourceLanguage,
          targetLanguage
        };
      } else {
        const cleanText = text
          .replace(/–/g, '-')
          .replace(/—/g, '-')
          .trim();
        
        console.log(`🌍 Translating from ${sourceLanguage} to ${targetLanguage}: "${cleanText.substring(0, 50)}..."`);
        
        const encodedText = encodeURIComponent(cleanText);
        const url = `${this.apiUrl}?q=${encodedText}&langpair=${sourceLanguage}|${targetLanguage}`;
        
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`MyMemory API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json() as any;
        
        if (data.responseStatus !== 200) {
          throw new Error(`MyMemory API error: ${data.responseStatus} - ${data.responseDetails || 'Unknown error'}`);
        }
        
        const translatedText = data.responseData.translatedText;
        
        console.log(`✅ Translation successful: "${translatedText.substring(0, 50)}..."`);
        
        return {
          translatedText,
          sourceLanguage,
          targetLanguage
        };
      }
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
      [sourceLanguage]: text
    };

    const targetLanguages = this.supportedLanguages.filter(lang => lang !== sourceLanguage);
    
    console.log(`🔄 Translating to ${targetLanguages.length} languages: ${targetLanguages.join(', ')}`);

    for (const targetLang of targetLanguages) {
      try {
        const result = await this.translateText(text, targetLang, sourceLanguage);
        results[targetLang] = result.translatedText;
        
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`Failed to translate to ${targetLang}:`, error);
        results[targetLang] = text;
      }
    }

    return results;
  }

  async detectTextChange(oldText: string | undefined, newText: string): Promise<boolean> {
    if (!oldText) return true;
    if (oldText === newText) return false;
    
    const normalizedOld = oldText.trim().toLowerCase();
    const normalizedNew = newText.trim().toLowerCase();
    
    return normalizedOld !== normalizedNew;
  }
}

export const autoTranslationService = new AutoTranslationService();
