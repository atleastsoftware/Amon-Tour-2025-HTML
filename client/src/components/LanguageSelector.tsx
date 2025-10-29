import { useState } from 'react';
import { useTranslation } from '../contexts/TranslationContext';
import { googleTranslateService } from '../services/googleTranslateService';
import { Check } from 'lucide-react';

const languageData = {
  en: { 
    name: "English", 
    flagUrl: "https://flagcdn.com/w40/gb.png",
    fallbackFlag: "🇬🇧"
  },
  fr: { 
    name: "Français", 
    flagUrl: "https://flagcdn.com/w40/fr.png",
    fallbackFlag: "🇫🇷"
  },
  es: { 
    name: "Español", 
    flagUrl: "https://flagcdn.com/w40/es.png",
    fallbackFlag: "🇪🇸"
  }
} as const;

export default function LanguageSelector() {
  const { currentLanguage, setLanguage, isChangingLanguage } = useTranslation();
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
  const [showDebug, setShowDebug] = useState(false);

  const handleLanguageChange = (langCode: string) => {
    console.log('🔍 Language button clicked:', {
      targetLanguage: langCode,
      currentLanguage,
      isChangingLanguage,
      isSameLanguage: currentLanguage === langCode
    });
    
    if (isChangingLanguage || currentLanguage === langCode) {
      console.log('⚠️ Language change blocked:', {
        isChangingLanguage,
        isSameLanguage: currentLanguage === langCode
      });
      return;
    }
    
    try {
      console.log('🔄 Calling setLanguage with:', langCode);
      setLanguage(langCode);
      console.log(`✅ Language change initiated to: ${langCode}`);
    } catch (error) {
      console.error('❌ Failed to switch language:', error);
    }
  };
  
  const handleClearCache = () => {
    console.log('🗑️ Clearing translation cache...');
    googleTranslateService.clearCache();
    localStorage.removeItem('translationCache');
    console.log('✅ Translation cache cleared! Next translation will make fresh API calls.');
    // Refresh the current language to trigger new API calls
    const currentLang = currentLanguage;
    setLanguage('en');
    setTimeout(() => {
      if (currentLang !== 'en') {
        setLanguage(currentLang);
      }
    }, 100);
  };

  const handleImageError = (langCode: string) => {
    setFailedImages(prev => new Set(prev).add(langCode));
  };

  return (
    <div className="relative flex items-center gap-2">
      {/* Debug mode toggle - only show in development */}
      {process.env.NODE_ENV === 'development' && (
        <button
          onClick={() => setShowDebug(!showDebug)}
          className="text-xs text-gray-500 hover:text-gray-700 mr-2"
          title="Toggle debug mode"
        >
          🔧
        </button>
      )}
      
      {Object.entries(languageData).map(([langCode, langData]) => (
        <button
          key={langCode}
          onClick={() => handleLanguageChange(langCode)}
          disabled={isChangingLanguage}
          className={`
            p-1 transition-all duration-200 rounded-md border-2 relative group
            ${currentLanguage === langCode 
              ? "scale-110 opacity-100 border-primary shadow-lg" 
              : "opacity-70 hover:opacity-100 border-transparent hover:border-gray-300"
            }
            ${isChangingLanguage ? "cursor-not-allowed" : "cursor-pointer"}
            disabled:opacity-50
          `}
          aria-label={`Switch to ${langData.name}`}
          title={langData.name}
          data-testid={`language-${langCode}`}
        >
          {!failedImages.has(langCode) ? (
            <img 
              src={langData.flagUrl} 
              alt={`${langData.name} flag`}
              className={`w-8 h-6 object-cover rounded ${isChangingLanguage ? "grayscale" : ""}`}
              loading="eager"
              onError={() => handleImageError(langCode)}
            />
          ) : (
            // Fallback to emoji flag if image fails
            <div className="w-8 h-6 flex items-center justify-center text-2xl">
              {langData.fallbackFlag}
            </div>
          )}
          
          {/* Show checkmark for active language */}
          {currentLanguage === langCode && (
            <div className="absolute -top-1 -right-1 bg-primary text-white rounded-full p-0.5">
              <Check className="w-3 h-3" />
            </div>
          )}
          
          {/* Loading overlay */}
          {isChangingLanguage && (
            <div className="absolute inset-0 bg-white/50 rounded flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </button>
      ))}
      
      {/* Debug panel - only show when debug mode is active */}
      {showDebug && (
        <div className="absolute top-full right-0 mt-2 p-3 bg-white border border-gray-200 rounded-md shadow-lg z-50">
          <div className="text-xs text-gray-600 mb-2">Debug Tools</div>
          <button
            onClick={handleClearCache}
            className="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
          >
            Clear Translation Cache
          </button>
          <div className="text-xs text-gray-500 mt-2">
            Clearing cache will force fresh API calls
          </div>
        </div>
      )}
    </div>
  );
}