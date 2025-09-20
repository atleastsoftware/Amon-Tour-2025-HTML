import { useState, useEffect } from 'react';
import { translationService } from '../services/translationService';
import { autoTranslate } from '../lib/autoTranslate';

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

export default function LanguageSelector() {
  const [isLoading, setIsLoading] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState(translationService.getCurrentLanguage());

  // Update current language when component mounts
  useEffect(() => {
    setCurrentLanguage(translationService.getCurrentLanguage());
  }, []);

  const handleLanguageChange = async (langCode: string) => {
    if (isLoading || currentLanguage === langCode) return;
    
    setIsLoading(true);
    
    try {
      // 1. Disable auto-translation system to prevent conflicts
      disableAutoTranslation();
      
      // 2. Change language using our translation service
      const success = translationService.setLanguage(langCode);
      if (success) {
        setCurrentLanguage(langCode);
        
        // 3. Mark that user made a manual language choice
        localStorage.setItem('amon-tour-translation-choice', `manual-${langCode}`);
        localStorage.setItem('user-chose-language', 'true');
        
        // 4. Force page reload to apply translations
        window.location.reload();
        console.log(`Manual language changed to: ${langCode}`);
      }
    } catch (error) {
      console.error('Failed to switch language:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Disable browser auto-translation when user makes manual choice
   */
  const disableAutoTranslation = () => {
    // Set translate="no" on document to disable browser translation
    document.documentElement.setAttribute('translate', 'no');
    
    // Remove any Google Translate widgets
    const googleTranslateElements = document.querySelectorAll('[id*="google_translate"], .goog-te-banner-frame, .goog-te-menu-frame');
    googleTranslateElements.forEach(el => el.remove());
    
    // Clear any translation meta tags
    const translationMetas = document.querySelectorAll('meta[name="google-translate-customization"], meta[name="translate"]');
    translationMetas.forEach(meta => meta.remove());
    
    // Hide any translation indicators
    const indicators = document.querySelectorAll('.translation-indicator');
    indicators.forEach(indicator => indicator.remove());
    
    // Stop auto-translation detection
    localStorage.setItem('amon-tour-disable-auto-translate', 'true');
    
    console.log('Browser auto-translation disabled - using manual TranslationService');
  };

  return (
    <div className="flex items-center gap-2">
      {Object.entries(languageData).map(([langCode, langData]) => (
        <button
          key={langCode}
          onClick={() => handleLanguageChange(langCode)}
          disabled={isLoading}
          className={`
            p-1 transition-all duration-200 rounded-md border-2 relative
            ${currentLanguage === langCode 
              ? "scale-110 opacity-100 border-primary shadow-lg" 
              : "opacity-70 hover:opacity-100 border-transparent hover:border-gray-300"
            }
            ${isLoading ? "cursor-not-allowed" : "cursor-pointer"}
            disabled:opacity-50
          `}
          aria-label={`Switch to ${langData.name}`}
          title={langData.name}
          data-testid={`language-${langCode}`}
        >
          <img 
            src={langData.flagUrl} 
            alt={`${langData.name} flag`}
            className={`w-8 h-6 object-cover rounded ${isLoading ? "grayscale" : ""}`}
            loading="eager"
            onError={(e) => {
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
            }}
          />
          {isLoading && currentLanguage === langCode && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded">
              <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </button>
      ))}
    </div>
  );
}