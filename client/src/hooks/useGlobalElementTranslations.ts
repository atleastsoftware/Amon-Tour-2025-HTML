import { useState, useEffect } from 'react';
import { useTranslation } from '@/contexts/TranslationContext';

interface TranslationData {
  [key: string]: string;
}

interface UseGlobalElementResult {
  translateValue: (section: string, key: string, fallback: string) => string;
  translateObject: (section: string, obj: Record<string, any>, keys: string[]) => Record<string, any>;
  translateArray: (section: string, arr: any[], keys: string[]) => any[];
  isLoading: boolean;
}

export function useGlobalElementTranslations(): UseGlobalElementResult {
  const { currentLanguage, isLoading: contextLoading } = useTranslation();
  const [translations, setTranslations] = useState<Record<string, TranslationData>>({});
  const [isLoading, setIsLoading] = useState(false);

  // Load translations from JSON files
  useEffect(() => {
    if (currentLanguage === 'en') {
      setTranslations({});
      return;
    }

    const loadTranslations = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/translations/${currentLanguage}.json`);
        if (response.ok) {
          const data = await response.json();
          setTranslations(data);
        } else {
          console.error(`Failed to load translations for ${currentLanguage}`);
          setTranslations({});
        }
      } catch (error) {
        console.error(`Error loading translations for ${currentLanguage}:`, error);
        setTranslations({});
      } finally {
        setIsLoading(false);
      }
    };

    loadTranslations();
  }, [currentLanguage]);

  // Helper to translate a single value
  const translateValue = (section: string, key: string, fallback: string): string => {
    if (currentLanguage === 'en' || !translations[section]) {
      return fallback;
    }
    return translations[section]?.[key] || fallback;
  };

  // Helper to translate an object with specific keys
  const translateObject = (
    section: string,
    obj: Record<string, any>,
    keys: string[]
  ): Record<string, any> => {
    if (currentLanguage === 'en') {
      return obj;
    }

    const translated = { ...obj };
    keys.forEach(key => {
      if (obj[key] !== undefined) {
        translated[key] = translateValue(section, key, obj[key]);
      }
    });
    return translated;
  };

  // Helper to translate an array of objects with specific keys
  const translateArray = (
    section: string,
    arr: any[],
    keys: string[]
  ): any[] => {
    if (currentLanguage === 'en') {
      return arr;
    }

    return arr.map((item, index) => {
      const translatedItem = { ...item };
      keys.forEach(key => {
        const translationKey = `item_${index}_${key}`;
        if (item[key] !== undefined) {
          translatedItem[key] = translateValue(section, translationKey, item[key]);
        }
      });
      return translatedItem;
    });
  };

  return {
    translateValue,
    translateObject,
    translateArray,
    isLoading: isLoading || contextLoading
  };
}
