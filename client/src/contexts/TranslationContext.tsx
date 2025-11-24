import { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from 'react';
import { staticTranslationService } from '../services/staticTranslationService';
import { googleTranslateService } from '../services/googleTranslateService';

interface TranslationContextType {
  currentLanguage: string;
  translations: any;
  setLanguage: (language: string) => void;
  isChangingLanguage: boolean;
  isPremiumFeature: boolean;
  isLoading: boolean;
  useDynamicTranslation: (text: string) => Promise<string>;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

// Get default English content from static translation service
const defaultTranslations = staticTranslationService.getTranslations('en');

export function TranslationProvider({ children }: { children: ReactNode }) {
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [translations, setTranslations] = useState(defaultTranslations);
  const [isChangingLanguage, setIsChangingLanguage] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPremiumFeature] = useState(false);

  // Load saved language preference and dynamic cache
  useEffect(() => {
    staticTranslationService.loadDynamicCache();
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

  // Use static translations - instant and free!
  const translateContent = useCallback(async (targetLang: string) => {
    console.log('🌍 Using static translations for:', targetLang);
    
    // Get translations from static JSON files
    const staticTranslations = staticTranslationService.getTranslations(targetLang);
    
    if (staticTranslations) {
      console.log('✅ Loaded static translations instantly');
      setTranslations(staticTranslations);
      return;
    }
    
    // Fallback to English if language not found
    console.log('⚠️ Language not found, using English');
    setTranslations(defaultTranslations);
  }, []);

  const setLanguage = useCallback(async (language: string) => {
    console.log('🔵 setLanguage called with:', language);
    
    if (language === currentLanguage) {
      console.log('⚠️ Language is already set to:', language);
      return;
    }
    
    if (!staticTranslationService.isLanguageSupported(language)) {
      console.error('❌ Language not supported:', language);
      return;
    }
    
    console.log('🔄 Changing language to:', language);
    setIsChangingLanguage(true);
    
    try {
      // Update language in static service
      staticTranslationService.setLanguage(language);
      
      // Update state
      setCurrentLanguage(language);
      document.documentElement.lang = language;
      
      // Save to localStorage for admin UI to detect
      localStorage.setItem('preferred-language', language);
      
      // Load translations instantly from static files
      await translateContent(language);
      
      // Dispatch custom event to notify admin UI components
      console.log('📢 Dispatching admin-language-changed event with language:', language);
      const event = new CustomEvent('admin-language-changed', { 
        detail: { language } 
      });
      window.dispatchEvent(event);
      
      console.log('✅ Language changed successfully to:', language);
    } catch (error) {
      console.error('❌ Error changing language:', error);
    } finally {
      setIsChangingLanguage(false);
    }
  }, [currentLanguage, translateContent]);
  
  // Function to translate dynamic content (like tour descriptions)
  const useDynamicTranslation = useCallback(async (text: string): Promise<string> => {
    if (!text || currentLanguage === 'en') {
      return text;
    }
    
    // Check if already cached
    const cached = staticTranslationService.getDynamicTranslation(text, currentLanguage);
    if (cached) {
      return cached;
    }
    
    // For dynamic content, we can optionally use Google API
    // But only if it's really needed (e.g., user-generated content)
    if (staticTranslationService.isDynamicContent(text)) {
      try {
        const translated = await googleTranslateService.translateText(text, currentLanguage, 'en');
        staticTranslationService.addDynamicTranslation(text, translated, currentLanguage);
        return translated;
      } catch (error) {
        console.error('Failed to translate dynamic content:', error);
        return text;
      }
    }
    
    return text;
  }, [currentLanguage]);

  const contextValue = useMemo(() => ({
    currentLanguage,
    translations,
    setLanguage,
    isChangingLanguage,
    isPremiumFeature,
    isLoading,
    useDynamicTranslation
  }), [currentLanguage, translations, setLanguage, isChangingLanguage, isPremiumFeature, isLoading, useDynamicTranslation]);

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

// Accept HMR but force a full page reload to prevent context loss
if (import.meta.hot) {
  import.meta.hot.accept(() => {
    window.location.reload();
  });
}