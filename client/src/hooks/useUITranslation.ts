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
        const response = await fetch(`/locales/ui.${currentLanguage}.json`);
        const data = await response.json();
        setTranslations(data);
      } catch (error) {
        console.error(`Failed to load UI translations for ${currentLanguage}:`, error);
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
