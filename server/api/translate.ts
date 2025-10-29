import express from 'express';
import fetch from 'node-fetch';

const router = express.Router();

// Google Translate API configuration
const GOOGLE_TRANSLATE_API_KEY = process.env.GOOGLE_TRANSLATE_API_KEY;
const GOOGLE_TRANSLATE_API_URL = 'https://translation.googleapis.com/language/translate/v2';

// Cache to store translations and reduce API calls
const translationCache = new Map<string, string>();

// Helper function to create cache key
function getCacheKey(text: string, targetLang: string, sourceLang: string = 'auto'): string {
  return `${sourceLang}:${targetLang}:${text}`;
}

// Batch translation endpoint
router.post('/api/translate/batch', async (req, res) => {
  try {
    const { texts, targetLanguage, sourceLanguage = 'auto' } = req.body;
    
    if (!GOOGLE_TRANSLATE_API_KEY) {
      return res.status(500).json({ 
        error: 'Translation service not configured',
        translations: texts // Return original texts as fallback
      });
    }

    if (!texts || !Array.isArray(texts) || texts.length === 0) {
      return res.status(400).json({ error: 'Invalid texts array' });
    }

    if (!targetLanguage) {
      return res.status(400).json({ error: 'Target language is required' });
    }

    // Check cache first and separate cached from non-cached texts
    const results: { [key: string]: string } = {};
    const textsToTranslate: string[] = [];
    
    for (const text of texts) {
      const cacheKey = getCacheKey(text, targetLanguage, sourceLanguage);
      const cached = translationCache.get(cacheKey);
      
      if (cached) {
        results[text] = cached;
      } else {
        textsToTranslate.push(text);
      }
    }

    // If all texts were cached, return immediately
    if (textsToTranslate.length === 0) {
      return res.json({ translations: results });
    }

    // Prepare Google Translate API request
    const params = new URLSearchParams({
      key: GOOGLE_TRANSLATE_API_KEY,
      target: targetLanguage
    });

    if (sourceLanguage !== 'auto') {
      params.append('source', sourceLanguage);
    }

    // Add all texts to translate
    textsToTranslate.forEach(text => {
      params.append('q', text);
    });

    // Make API request
    const response = await fetch(`${GOOGLE_TRANSLATE_API_URL}?${params}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      }
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Google Translate API error:', error);
      
      // Return original texts as fallback
      textsToTranslate.forEach(text => {
        results[text] = text;
      });
      
      return res.json({ 
        translations: results,
        warning: 'Translation service temporarily unavailable'
      });
    }

    const data = await response.json() as any;
    
    // Process translations and update cache
    if (data.data && data.data.translations) {
      data.data.translations.forEach((translation: any, index: number) => {
        const originalText = textsToTranslate[index];
        const translatedText = translation.translatedText;
        
        results[originalText] = translatedText;
        
        // Update cache
        const cacheKey = getCacheKey(originalText, targetLanguage, sourceLanguage);
        translationCache.set(cacheKey, translatedText);
      });
    }

    res.json({ translations: results });
  } catch (error) {
    console.error('Translation error:', error);
    
    // Return original texts as fallback
    const { texts } = req.body;
    const fallback: { [key: string]: string } = {};
    texts.forEach((text: string) => {
      fallback[text] = text;
    });
    
    res.json({ 
      translations: fallback,
      warning: 'Translation service error'
    });
  }
});

// Single text translation endpoint
router.post('/api/translate', async (req, res) => {
  try {
    const { text, targetLanguage, sourceLanguage = 'auto' } = req.body;
    
    if (!GOOGLE_TRANSLATE_API_KEY) {
      return res.status(500).json({ 
        error: 'Translation service not configured',
        translation: text // Return original text as fallback
      });
    }

    if (!text || !targetLanguage) {
      return res.status(400).json({ error: 'Text and target language are required' });
    }

    // Check cache first
    const cacheKey = getCacheKey(text, targetLanguage, sourceLanguage);
    const cached = translationCache.get(cacheKey);
    
    if (cached) {
      return res.json({ translation: cached, cached: true });
    }

    // Prepare Google Translate API request
    const params = new URLSearchParams({
      key: GOOGLE_TRANSLATE_API_KEY,
      q: text,
      target: targetLanguage
    });

    if (sourceLanguage !== 'auto') {
      params.append('source', sourceLanguage);
    }

    // Make API request
    const response = await fetch(`${GOOGLE_TRANSLATE_API_URL}?${params}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      }
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Google Translate API error:', error);
      return res.json({ 
        translation: text, // Return original text as fallback
        warning: 'Translation service temporarily unavailable'
      });
    }

    const data = await response.json() as any;
    const translation = data.data?.translations?.[0]?.translatedText || text;

    // Update cache
    translationCache.set(cacheKey, translation);

    res.json({ translation });
  } catch (error) {
    console.error('Translation error:', error);
    res.json({ 
      translation: req.body.text, // Return original text as fallback
      warning: 'Translation service error'
    });
  }
});

// Clear cache endpoint (for admin use)
router.post('/api/translate/clear-cache', (req, res) => {
  translationCache.clear();
  res.json({ message: 'Translation cache cleared' });
});

export default router;