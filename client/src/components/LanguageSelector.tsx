import { useState } from 'react';

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
  const [currentLanguage, setCurrentLanguage] = useState('en');

  const handleLanguageChange = async (langCode: string) => {
    if (isLoading || currentLanguage === langCode) return;
    
    setIsLoading(true);
    
    try {
      // Future: Will integrate with LinguiJS + Microsoft Translator properly
      // For now, just store the selection
      localStorage.setItem('preferred-language', langCode);
      setCurrentLanguage(langCode);
      console.log(`Language selected: ${langCode} (LinguiJS integration pending)`);
    } catch (error) {
      console.error('Failed to switch language:', error);
    } finally {
      setIsLoading(false);
    }
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