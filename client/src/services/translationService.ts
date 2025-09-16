// Microsoft Translator Text API Service
// Using free tier: 2M characters/month

interface TranslationResponse {
  translations: Array<{
    text: string;
    to: string;
  }>;
}

interface TranslationRequest {
  text: string;
  from: string;
  to: string;
}

class MicrosoftTranslationService {
  private baseUrl = 'https://api.cognitive.microsofttranslator.com/translate';
  private apiVersion = '3.0';
  
  async translateText({ text, from = 'en', to }: TranslationRequest): Promise<string> {
    try {
      // For now, we'll use environment variable for API key
      // Later we can integrate with Replit's secret management
      const apiKey = (import.meta as any).env?.VITE_MICROSOFT_TRANSLATOR_KEY;
      
      if (!apiKey) {
        console.warn('Microsoft Translator API key not found, skipping translation');
        return text;
      }

      const url = `${this.baseUrl}?api-version=${this.apiVersion}&from=${from}&to=${to}`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': apiKey,
          'Ocp-Apim-Subscription-Region': 'global',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([{ text }])
      });

      if (!response.ok) {
        throw new Error(`Translation failed: ${response.status} ${response.statusText}`);
      }

      const data: TranslationResponse[] = await response.json();
      return data[0]?.translations[0]?.text || text;
    } catch (error) {
      console.error('Translation error:', error);
      return text; // Return original text if translation fails
    }
  }

  async translateMultiple(texts: string[], from: string = 'en', to: string): Promise<string[]> {
    try {
      const apiKey = (import.meta as any).env?.VITE_MICROSOFT_TRANSLATOR_KEY;
      
      if (!apiKey) {
        console.warn('Microsoft Translator API key not found, returning original texts');
        return texts;
      }

      const url = `${this.baseUrl}?api-version=${this.apiVersion}&from=${from}&to=${to}`;
      
      const body = texts.map(text => ({ text }));
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': apiKey,
          'Ocp-Apim-Subscription-Region': 'global',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        throw new Error(`Batch translation failed: ${response.status} ${response.statusText}`);
      }

      const data: TranslationResponse[] = await response.json();
      return data.map(item => item?.translations[0]?.text || '');
    } catch (error) {
      console.error('Batch translation error:', error);
      return texts; // Return original texts if translation fails
    }
  }
}

export const translationService = new MicrosoftTranslationService();