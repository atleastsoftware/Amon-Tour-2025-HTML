import { HttpsProxyAgent } from 'https-proxy-agent';

export interface TranslationResult {
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
}

export interface BatchTranslationResult {
  [language: string]: string;
}

class AutoTranslationService {
  private readonly supportedLanguages = ['en', 'fr', 'es'];
  private translateModule: any = null;
  
  private async getTranslateModule() {
    if (!this.translateModule) {
      const module = await import('@vitalets/google-translate-api');
      this.translateModule = module.translate || module.default || module;
    }
    return this.translateModule;
  }
  
  async translateText(
    text: string,
    targetLanguage: string,
    sourceLanguage: string = 'en'
  ): Promise<TranslationResult> {
    try {
      const translate = await this.getTranslateModule();
      const hasNewlines = text.includes('\n');
      
      if (hasNewlines) {
        console.log(`🌍 Translating multi-line text from ${sourceLanguage} to ${targetLanguage} (keeping context)`);
        
        const cleanText = text
          .replace(/–/g, '-')
          .replace(/—/g, '-');
        
        const textWithPlaceholder = cleanText.replace(/\n/g, ' [[NEWLINE]] ');
        
        console.log(`  📝 Translating: "${textWithPlaceholder.substring(0, 80)}..."`);
        
        const result = await translate(textWithPlaceholder, { 
          from: sourceLanguage, 
          to: targetLanguage,
          fetchOptions: {
            agent: new HttpsProxyAgent('http://proxy:3128')
          }
        });
        
        let translatedText = result.text;
        translatedText = translatedText.replace(/\s*\[\[NEWLINE\]\]\s*/g, '\n');
        
        console.log(`✅ Multi-line translation complete: "${translatedText.substring(0, 80)}..."`);
        
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
        
        const result = await translate(cleanText, { 
          from: sourceLanguage, 
          to: targetLanguage,
          fetchOptions: {
            agent: new HttpsProxyAgent('http://proxy:3128')
          }
        });
        
        const translatedText = result.text;
        
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
        
        await new Promise(resolve => setTimeout(resolve, 1000));
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
