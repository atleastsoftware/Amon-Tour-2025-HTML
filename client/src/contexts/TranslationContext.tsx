import { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { translationService, Translations } from '../services/translationService';

interface TranslationContextType {
  currentLanguage: string;
  translations: Translations;
  setLanguage: (language: string) => void;
  isChangingLanguage: boolean;
  isPremiumFeature: boolean; // For future paywall
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

export function TranslationProvider({ children }: { children: ReactNode }) {
  const [currentLanguage, setCurrentLanguage] = useState(translationService.getCurrentLanguage());
  const [isChangingLanguage, setIsChangingLanguage] = useState(false);
  const [isPremiumFeature] = useState(false); // Will be used for paywall later
  
  // Force re-render by creating new translations object when language changes
  const [translationKey, setTranslationKey] = useState(0);

  useEffect(() => {
    // Initialize with saved language preference
    const savedLanguage = localStorage.getItem('preferred-language');
    if (savedLanguage && ['en', 'fr', 'es'].includes(savedLanguage)) {
      translationService.setLanguage(savedLanguage);
      setCurrentLanguage(savedLanguage);
      setTranslationKey(prev => prev + 1); // Force re-render
      document.documentElement.lang = savedLanguage;
    }
  }, []);

  const setLanguage = (language: string) => {
    if (language === currentLanguage) return;
    
    // Future paywall check
    if (isPremiumFeature && language !== 'en') {
      // In the future, show paywall modal here
      console.log('Premium feature required for language switching');
      // For now, allow it to work
    }
    
    setIsChangingLanguage(true);
    
    // Update translation service
    const success = translationService.setLanguage(language);
    
    if (success) {
      setCurrentLanguage(language);
      setTranslationKey(prev => prev + 1); // Force re-render with new translations
      document.documentElement.lang = language;
      localStorage.setItem('preferred-language', language);
      
      // Small delay to show language is changing
      setTimeout(() => {
        setIsChangingLanguage(false);
      }, 300);
    } else {
      setIsChangingLanguage(false);
    }
  };

  // Create new translations object on each render when key changes
  const translations = useMemo(() => {
    // Force a new object to trigger re-renders
    return { ...translationService.getTranslations() };
  }, [translationKey, currentLanguage]);

  const contextValue = useMemo(() => ({
    currentLanguage,
    translations,
    setLanguage,
    isChangingLanguage,
    isPremiumFeature
  }), [currentLanguage, translations, isChangingLanguage, isPremiumFeature]);

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
export function useTranslationSection<T extends keyof Translations>(section: T): Translations[T] {
  const { translations } = useTranslation();
  return translations[section];
}