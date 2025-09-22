import { useState, useEffect } from 'react';
import { autoTranslate } from '../lib/autoTranslate';

export default function LanguageSelector() {
  const languageData = {
    en: {
      name: "English",
      flagUrl: "https://flagcdn.com/w40/gb.png"
    },
    fr: {
      name: "Français",
      flagUrl: "https://flagcdn.com/w40/fr.png"
    },
    es: {
      name: "Español",
      flagUrl: "https://flagcdn.com/w40/es.png"
    }
  } as const;
  
  const [isLoading, setIsLoading] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    // Detect current language from localStorage or browser
    const saved = localStorage.getItem('amon-tour-language-choice');
    if (saved) return saved;
    
    const browserLang = navigator.language?.split('-')[0]?.toLowerCase() || 'en';
    return ['en', 'fr', 'es'].includes(browserLang) ? browserLang : 'en';
  });

  const handleLanguageChange = async (langCode: string) => {
    if (isLoading || currentLanguage === langCode) return;
    
    setIsLoading(true);
    setCurrentLanguage(langCode);
    
    try {
      // Clear any existing translation state
      clearExistingTranslations();
      
      // Save user's choice
      localStorage.setItem('amon-tour-language-choice', langCode);
      localStorage.setItem('amon-tour-translation-choice', `manual-${langCode}`);
      localStorage.setItem('user-chose-language', 'true');
      
      console.log(`🌐 Language changed to: ${langCode}`);
      
      if (langCode === 'en') {
        // Restore English - reload page to clear all translations
        autoTranslate.restoreEnglish();
      } else if (langCode === 'fr') {
        // Trigger French translation
        autoTranslate.manualTrigger('fr');
      } else if (langCode === 'es') {
        // Trigger Spanish translation
        autoTranslate.manualTrigger('es');
      }
    } catch (error) {
      console.error('Failed to switch language:', error);
      setCurrentLanguage('en'); // Fallback to English
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Clear existing translations before applying new ones
   */
  const clearExistingTranslations = () => {
    // Remove translation attributes temporarily
    document.documentElement.removeAttribute('translate');
    
    // Remove any Google Translate widgets
    const googleTranslateElements = document.querySelectorAll('[id*="google_translate"], .goog-te-banner-frame, .goog-te-menu-frame');
    googleTranslateElements.forEach(el => el.remove());
    
    // Clear any old translation meta tags
    const translationMetas = document.querySelectorAll('meta[name="google-translate-customization"], meta[name="translate"]');
    translationMetas.forEach(meta => meta.remove());
    
    // Hide any translation indicators
    const indicators = document.querySelectorAll('.translation-indicator');
    indicators.forEach(indicator => indicator.remove());
  };
  return <div className="flex items-center gap-2">
      {Object.entries(languageData).map(([langCode, langData]) => <button key={langCode} onClick={() => handleLanguageChange(langCode)} disabled={isLoading} className={`
            p-1 transition-all duration-200 rounded-md border-2 relative
            ${currentLanguage === langCode ? "scale-110 opacity-100 border-primary shadow-lg" : "opacity-70 hover:opacity-100 border-transparent hover:border-gray-300"}
            ${isLoading ? "cursor-not-allowed" : "cursor-pointer"}
            disabled:opacity-50
          `} aria-label={`Switch to ${langData.name}`} title={langData.name} data-testid={`language-${langCode}`}>
          <img src={langData.flagUrl} alt={`${langData.name} flag`} className={`w-8 h-6 object-cover rounded ${isLoading ? "grayscale" : ""}`} loading="eager" onError={e => {
        console.warn(`Failed to load flag for ${langData.name}:`, langData.flagUrl);
        // Fallback: show text instead of flag
        const target = e.target as HTMLImageElement;
        target.style.display = 'none';
        const parent = target.parentElement!;
        if (!parent.querySelector('span')) {
          const span = document.createElement('span');
          span.className = 'text-xs font-bold px-2 py-1';
          span.textContent = langCode.toUpperCase();
          parent.appendChild(span);
        }
      }} />
          {isLoading && currentLanguage === langCode && <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded">
              <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
            </div>}
        </button>)}
    </div>;
}