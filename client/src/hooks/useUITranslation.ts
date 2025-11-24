import { useState, useEffect } from 'react';
import { useTranslation } from '@/contexts/TranslationContext';

type UITranslations = {
  [key: string]: any;
};

export function useUITranslation() {
  const translationContext = useTranslation();
  const contextLanguage = translationContext?.currentLanguage || 'en';
  
  // Force re-render when language changes by using a local state
  const [currentLanguage, setCurrentLanguage] = useState(contextLanguage);
  const [translations, setTranslations] = useState<UITranslations>({});
  const [isLoading, setIsLoading] = useState(true);

  console.log(`🟢🟢🟢 [useUITranslation] Hook RE-RENDER with language: ${currentLanguage}`);

  // Synchronize with context language changes
  useEffect(() => {
    console.log(`🔄 [useUITranslation] Context language is: ${contextLanguage}, current is: ${currentLanguage}`);
    
    if (contextLanguage !== currentLanguage) {
      console.log(`🔄🔄🔄 [useUITranslation] FORCING language update from ${currentLanguage} to ${contextLanguage}`);
      setCurrentLanguage(contextLanguage);
    }
  }, [contextLanguage]);

  // Load translations when language changes
  useEffect(() => {
    console.log(`🔄🔄🔄 [useUITranslation] useEffect TRIGGERED! Language changed to: ${currentLanguage}`);
    
    const loadTranslations = async () => {
      try {
        setIsLoading(true);
        console.log(`🔵🔵🔵 [useUITranslation] START Loading UI translations for language: ${currentLanguage}`);
        
        const url = `/locales/ui.${currentLanguage}.json`;
        console.log(`🔵 [useUITranslation] Fetching from URL: ${url}`);
        
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log(`✅✅✅ [useUITranslation] Successfully loaded ${Object.keys(data).length} translation sections for ${currentLanguage}`);
        console.log(`✅ [useUITranslation] Available sections:`, Object.keys(data));
        
        setTranslations(data);
        console.log(`✅✅✅ [useUITranslation] Translations STATE UPDATED for ${currentLanguage}`);
      } catch (error) {
        console.error(`❌❌❌ [useUITranslation] Failed to load UI translations for ${currentLanguage}:`, error);
        setTranslations({});
      } finally {
        setIsLoading(false);
        console.log(`✅ [useUITranslation] Loading completed, isLoading set to false`);
      }
    };

    loadTranslations();
  }, [currentLanguage]);

  const t = (key: string, params?: Record<string, string | number>): string => {
    // If translations are still loading, return the key
    if (isLoading || Object.keys(translations).length === 0) {
      console.log(`⏳ [useUITranslation] Translations still loading, returning key: ${key}`);
      return key;
    }
    
    const keys = key.split('.');
    let value: any = translations;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        console.warn(`⚠️ [useUITranslation] Translation key not found: ${key} (failed at segment: ${k})`);
        console.warn(`⚠️ [useUITranslation] Available keys at this level:`, value && typeof value === 'object' ? Object.keys(value) : 'not an object');
        return key;
      }
    }
    
    if (typeof value !== 'string') {
      console.warn(`⚠️ [useUITranslation] Translation value is not a string: ${key}, got type: ${typeof value}`);
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
