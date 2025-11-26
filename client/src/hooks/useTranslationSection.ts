import { useState, useEffect } from 'react';

type UITranslations = {
  [key: string]: any;
};

/**
 * Hook for using translations scoped to a specific section
 * @param section - The section name (e.g., 'admin', 'forms', 'common')
 * @returns Object with translation function `t`, loading state, and current language
 */
export function useTranslationSection(section: string) {
  // Get initial language from localStorage
  const getInitialLanguage = () => {
    const saved = localStorage.getItem('preferred-language');
    return saved && ['en', 'fr', 'es'].includes(saved) ? saved : 'en';
  };
  
  const [currentLanguage, setCurrentLanguage] = useState(getInitialLanguage());
  const [translations, setTranslations] = useState<UITranslations>({});
  const [isLoading, setIsLoading] = useState(true);

  // Listen to custom language change events
  useEffect(() => {
    const handleLanguageChange = (event: Event) => {
      const customEvent = event as CustomEvent<{ language: string }>;
      const newLanguage = customEvent.detail.language;
      setCurrentLanguage(newLanguage);
    };
    
    window.addEventListener('admin-language-changed', handleLanguageChange);
    
    return () => {
      window.removeEventListener('admin-language-changed', handleLanguageChange);
    };
  }, []);

  // Load translations when language changes
  useEffect(() => {
    const loadTranslations = async () => {
      try {
        setIsLoading(true);
        
        // Try to load from the UI locale file
        const response = await fetch(`/locales/ui.${currentLanguage}.json?t=${Date.now()}`);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // Extract the section if it exists
        const sectionData = data[section] || data;
        setTranslations(sectionData);
      } catch (error) {
        console.error(`[useTranslationSection] Failed to load translations for ${section} in ${currentLanguage}:`, error);
        setTranslations({});
      } finally {
        setIsLoading(false);
      }
    };

    loadTranslations();
  }, [currentLanguage, section]);

  const t = (key: string, params?: Record<string, string | number>): string => {
    // If translations are still loading, return the key
    if (isLoading || Object.keys(translations).length === 0) {
      return key;
    }
    
    const keys = key.split('.');
    let value: any = translations;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        console.warn(`[useTranslationSection(${section})] Translation key not found: ${key} (failed at segment: ${k})`);
        return key;
      }
    }
    
    if (typeof value !== 'string') {
      console.warn(`[useTranslationSection(${section})] Translation value is not a string: ${key}, got type: ${typeof value}`);
      return key;
    }
    
    if (params) {
      return Object.entries(params).reduce((text, [param, val]) => {
        return text.replace(new RegExp(`{{${param}}}`, 'g'), String(val));
      }, value);
    }
    
    return value;
  };

  return { 
    t: translations, 
    translate: t, 
    isLoading, 
    language: currentLanguage 
  };
}
