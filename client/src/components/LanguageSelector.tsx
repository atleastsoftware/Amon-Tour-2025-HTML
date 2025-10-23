import { useState } from 'react';
import { useTranslation } from '../contexts/TranslationContext';
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

  const handleLanguageChange = (langCode: string) => {
    if (isChangingLanguage || currentLanguage === langCode) return;
    
    try {
      setLanguage(langCode);
      console.log(`Language changed to: ${langCode}`);
    } catch (error) {
      console.error('Failed to switch language:', error);
    }
  };

  const handleImageError = (langCode: string) => {
    setFailedImages(prev => new Set(prev).add(langCode));
  };

  return (
    <div className="flex items-center gap-2">
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
    </div>
  );
}