import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { translationService, Translations } from '../services/translationService';

interface TranslationContextType {
  currentLanguage: string;
  translations: Translations;
  setLanguage: (language: string) => void;
  isChangingLanguage: boolean;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

export function TranslationProvider({ children }: { children: ReactNode }) {
  const [currentLanguage, setCurrentLanguage] = useState(translationService.getCurrentLanguage());
  const [translations, setTranslations] = useState(translationService.getTranslations());
  const [isChangingLanguage, setIsChangingLanguage] = useState(false);

  useEffect(() => {
    // Initialize with saved language preference
    const savedLanguage = localStorage.getItem('preferred-language');
    if (savedLanguage && ['en', 'fr', 'es'].includes(savedLanguage)) {
      translationService.setLanguage(savedLanguage);
      setCurrentLanguage(savedLanguage);
      setTranslations(translationService.getTranslations());
      document.documentElement.lang = savedLanguage;
    }
  }, []);

  const setLanguage = (language: string) => {
    if (language === currentLanguage) return;
    
    setIsChangingLanguage(true);
    
    // Update translation service
    const success = translationService.setLanguage(language);
    
    if (success) {
      setCurrentLanguage(language);
      setTranslations(translationService.getTranslations());
      document.documentElement.lang = language;
      
      // Small delay to show language is changing
      setTimeout(() => {
        setIsChangingLanguage(false);
      }, 300);
    } else {
      setIsChangingLanguage(false);
    }
  };

  return (
    <TranslationContext.Provider value={{
      currentLanguage,
      translations,
      setLanguage,
      isChangingLanguage
    }}>
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
export function useTranslationSection<T extends keyof Translations>(section: T): Translations[T] {
  const { translations } = useTranslation();
  return translations[section];
}