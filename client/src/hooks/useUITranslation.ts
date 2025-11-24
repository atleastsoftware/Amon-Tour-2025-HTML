import { useState, useEffect } from 'react';

type UITranslations = {
  [key: string]: any;
};

export function useUITranslation() {
  // Get initial language from localStorage
  const getInitialLanguage = () => {
    const saved = localStorage.getItem('preferred-language');
    return saved && ['en', 'fr', 'es'].includes(saved) ? saved : 'en';
  };
  
  const [currentLanguage, setCurrentLanguage] = useState(getInitialLanguage());
  const [translations, setTranslations] = useState<UITranslations>({});
  const [isLoading, setIsLoading] = useState(true);

  console.log(`🟢🟢🟢 [useUITranslation] Hook RENDER with language: ${currentLanguage}`);

  // Listen to custom language change events
  useEffect(() => {
    console.log(`👂 [useUITranslation] Setting up event listener for admin-language-changed`);
    
    const handleLanguageChange = (event: Event) => {
      const customEvent = event as CustomEvent<{ language: string }>;
      const newLanguage = customEvent.detail.language;
      console.log(`📢📢📢 [useUITranslation] Received admin-language-changed event! New language: ${newLanguage}`);
      setCurrentLanguage(newLanguage);
    };
    
    window.addEventListener('admin-language-changed', handleLanguageChange);
    
    return () => {
      console.log(`🔇 [useUITranslation] Removing event listener`);
      window.removeEventListener('admin-language-changed', handleLanguageChange);
    };
  }, []);

  // Load translations when language changes
  useEffect(() => {
    console.log(`🔄🔄🔄 [useUITranslation] Language changed to: ${currentLanguage}, LOADING translations...`);
    
    const loadTranslations = async () => {
      try {
        setIsLoading(true);
        console.log(`🔵🔵🔵 [useUITranslation] START Loading UI translations for: ${currentLanguage}`);
        
        const url = `/locales/ui.${currentLanguage}.json?t=${Date.now()}`;
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
