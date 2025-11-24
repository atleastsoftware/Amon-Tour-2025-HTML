import { useState, useEffect } from 'react';
import { useTranslation } from '@/contexts/TranslationContext';

type UITranslations = {
  [key: string]: any;
};

export function useUITranslation() {
  const { currentLanguage } = useTranslation();
  const [translations, setTranslations] = useState<UITranslations>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadTranslations = async () => {
      try {
        setIsLoading(true);
        console.log(`🔵 [useUITranslation] Loading UI translations for language: ${currentLanguage}`);
        
        const url = `/locales/ui.${currentLanguage}.json`;
        console.log(`🔵 [useUITranslation] Fetching from URL: ${url}`);
        
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log(`✅ [useUITranslation] Successfully loaded ${Object.keys(data).length} translation sections for ${currentLanguage}`);
        console.log(`✅ [useUITranslation] Available sections:`, Object.keys(data));
        
        setTranslations(data);
      } catch (error) {
        console.error(`❌ [useUITranslation] Failed to load UI translations for ${currentLanguage}:`, error);
        setTranslations({});
      } finally {
        setIsLoading(false);
      }
    };

    loadTranslations();
  }, [currentLanguage]);

  const t = (key: string, params?: Record<string, string | number>): string => {
    const keys = key.split('.');
    let value: any = translations;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        console.warn(`Translation key not found: ${key}`);
        return key;
      }
    }
    
    if (typeof value !== 'string') {
      console.warn(`Translation value is not a string: ${key}`);
      return key;
    }
    
    if (params) {
      return Object.entries(params).reduce((text, [param, val]) => {
        return text.replace(new RegExp(`{{${param}}}`, 'g'), String(val));
      }, value);
    }
    
    return value;
  };

  return { t, isLoading, language: currentLanguage };
}
