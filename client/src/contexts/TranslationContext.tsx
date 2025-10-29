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
    if (savedLanguage && savedLanguage !== 'en') {
      // Only auto-load non-English languages
      // We'll translate on mount
      setCurrentLanguage(savedLanguage);
      document.documentElement.lang = savedLanguage;
    }
  }, []);


  const setLanguage = useCallback(async (language: string) => {
    console.log('🔵 setLanguage called with:', {
      newLanguage: language,
      currentLanguage,
      isSame: language === currentLanguage
    });
    
    if (language === currentLanguage) {
      console.log('⚠️ Language is already set to:', language);
      return;
    }
    
    console.log('🔄 Starting language change process...');
    setIsChangingLanguage(true);
    
    try {
      // Translate content FIRST before updating language
      console.log('🌐 Starting content translation...');
      if (language === 'en') {
        console.log('🔤 Resetting to English content');
        // Reset to default English content
        setTranslations(defaultTranslations);
      } else {
        console.log('📡 Calling Google Translate API for:', language);
        console.log('📦 Content to translate:', {
          hasContent: !!defaultTranslations,
          sections: Object.keys(defaultTranslations || {})
        });
        
        setIsLoading(true);
        try {
          // Translate the entire translations object
          const translatedContent = await googleTranslateService.translateObject(
            defaultTranslations,
            language,
            'en'
          );
          
          console.log('📥 Received translated content:', {
            hasContent: !!translatedContent,
            sections: Object.keys(translatedContent || {}),
            sample: translatedContent?.nav?.tours // Log a sample to verify content
          });
          
          // Force new object reference for React to detect change
          setTranslations({...translatedContent});
          console.log('✅ Translations updated successfully');
        } finally {
          setIsLoading(false);
        }
      }
      
      // Then update language state
      console.log('📝 Updating language state to:', language);
      setCurrentLanguage(language);
      document.documentElement.lang = language;
      localStorage.setItem('preferred-language', language);
      
      console.log('✅ Language state and content updated');
    } catch (error) {
      console.error('❌ Error in setLanguage:', error);
    } finally {
      console.log('🏁 Language change process complete');
      setIsChangingLanguage(false);
    }
  }, [currentLanguage]);

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