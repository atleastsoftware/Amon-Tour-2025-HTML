import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export default function LanguageSelector() {
  const { i18n } = useTranslation();
  
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
    // Use i18next current language if available, fallback to saved preference or browser language
    if (i18n.language && ['en', 'fr', 'es'].includes(i18n.language)) {
      return i18n.language;
    }
    
    const saved = localStorage.getItem('i18nextLng');
    if (saved && ['en', 'fr', 'es'].includes(saved)) return saved;
    
    const browserLang = navigator.language?.split('-')[0]?.toLowerCase() || 'en';
    return ['en', 'fr', 'es'].includes(browserLang) ? browserLang : 'en';
  });

  // Sync with i18next language changes
  useEffect(() => {
    const handleLanguageChanged = (lng: string) => {
      if (['en', 'fr', 'es'].includes(lng)) {
        setCurrentLanguage(lng);
      }
    };

    i18n.on('languageChanged', handleLanguageChanged);
    return () => {
      i18n.off('languageChanged', handleLanguageChanged);
    };
  }, [i18n]);

  const handleLanguageChange = async (langCode: string) => {
    if (isLoading || currentLanguage === langCode) return;
    
    setIsLoading(true);
    setCurrentLanguage(langCode);
    
    try {
      // Change language using i18next
      await i18n.changeLanguage(langCode);
      
      // Save user's choice for persistence 
      localStorage.setItem('user-chose-language', 'true');
      localStorage.setItem('amon-tour-language-choice', langCode);
      
      console.log(`🌐 Language changed to: ${langCode}`);
      
    } catch (error) {
      console.error('Failed to switch language:', error);
      setCurrentLanguage('en'); // Fallback to English
      await i18n.changeLanguage('en');
    } finally {
      setIsLoading(false);
    }
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