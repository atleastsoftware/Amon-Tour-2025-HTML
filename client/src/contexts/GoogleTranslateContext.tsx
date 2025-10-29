import { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from 'react';
import { googleTranslateService } from '../services/googleTranslateService';
import { translationService } from '../services/translationService';

interface TranslationContextType {
  currentLanguage: string;
  translations: any;
  setLanguage: (language: string) => void;
  isChangingLanguage: boolean;
  isPremiumFeature: boolean;
  isLoading: boolean;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

// Get default English content from existing translation service
const defaultTranslations = translationService.getTranslations();

export function TranslationProvider({ children }: { children: ReactNode }) {
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [translations, setTranslations] = useState(defaultTranslations);
  const [isChangingLanguage, setIsChangingLanguage] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPremiumFeature] = useState(false);

  // Load saved language preference
  useEffect(() => {
    const savedLanguage = localStorage.getItem('preferred-language');
    if (savedLanguage && ['en', 'fr', 'es'].includes(savedLanguage)) {
      if (savedLanguage !== 'en') {
        setLanguage(savedLanguage);
      } else {
        setCurrentLanguage(savedLanguage);
        document.documentElement.lang = savedLanguage;
      }
    }
  }, []);

  // Translate all content when language changes
  const translateContent = useCallback(async (targetLang: string) => {
    if (targetLang === 'en') {
      // Reset to default English content
      setTranslations(defaultTranslations);
      return;
    }

    setIsLoading(true);
    
    try {
      // Translate the entire translations object
      const translatedContent = await googleTranslateService.translateObject(
        defaultTranslations,
        targetLang,
        'en'
      );
      
      setTranslations(translatedContent);
    } catch (error) {
      console.error('Translation failed:', error);
      // Keep current translations on error
    } finally {
      setIsLoading(false);
    }
  }, []);

  const setLanguage = useCallback(async (language: string) => {
    if (language === currentLanguage) return;
    
    setIsChangingLanguage(true);
    
    try {
      // Update language
      setCurrentLanguage(language);
      document.documentElement.lang = language;
      localStorage.setItem('preferred-language', language);
      
      // Log language change
      console.log('Language changed to:', language);
      
      // Translate content
      await translateContent(language);
    } finally {
      setIsChangingLanguage(false);
    }
  }, [currentLanguage, translateContent]);

  const contextValue = useMemo(() => ({
    currentLanguage,
    translations,
    setLanguage,
    isChangingLanguage,
    isPremiumFeature,
    isLoading
  }), [currentLanguage, translations, setLanguage, isChangingLanguage, isPremiumFeature, isLoading]);

  return (
    <TranslationContext.Provider value={contextValue}>
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(TranslationContext);
  
  if (context === undefined) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  
  return context;
}

// Helper hook to get specific translation section
export function useTranslationSection<T = any>(section: string): T {
  const { translations } = useTranslation();
  return translations[section] || {};
}