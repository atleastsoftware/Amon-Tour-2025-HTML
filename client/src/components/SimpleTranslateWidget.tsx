import { useState, useEffect } from "react";

const languages = [
  { 
    code: "en", 
    name: "English", 
    flagUrl: "https://flagcdn.com/w40/gb.png"
  },
  { 
    code: "fr", 
    name: "Français", 
    flagUrl: "https://flagcdn.com/w40/fr.png"
  },
  { 
    code: "es", 
    name: "Español", 
    flagUrl: "https://flagcdn.com/w40/es.png"
  }
];

export default function SimpleTranslateWidget() {
  const [currentLanguage, setCurrentLanguage] = useState<string>("en");

  useEffect(() => {
    // Check current language from cookie
    const cookies = document.cookie.split('; ');
    const googtrans = cookies.find(row => row.startsWith('googtrans='));
    
    if (googtrans) {
      const value = googtrans.split('=')[1];
      // Extract language code from cookie value like "/en/fr"
      const parts = value.split('/');
      const langCode = parts[parts.length - 1];
      if (langCode && ['en', 'fr', 'es'].includes(langCode)) {
        setCurrentLanguage(langCode);
      }
    }

    // Initialize Google Translate
    const script = document.createElement("script");
    script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    script.async = true;
    document.body.appendChild(script);

    window.googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement(
        {
          pageLanguage: "en",
          includedLanguages: "en,fr,es",
          layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
          autoDisplay: false
        },
        "google_translate_element_simple"
      );
    };

    return () => {
      // Cleanup
      const existingScript = document.querySelector('script[src*="translate.google.com"]');
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, []);

  const handleLanguageChange = (langCode: string) => {
    // Set the cookie
    const expires = new Date();
    expires.setFullYear(expires.getFullYear() + 1);
    
    if (langCode === "en") {
      // Clear translation
      document.cookie = `googtrans=/en/en; path=/; expires=${expires.toUTCString()}`;
    } else {
      // Set translation
      document.cookie = `googtrans=/en/${langCode}; path=/; expires=${expires.toUTCString()}`;
    }
    
    setCurrentLanguage(langCode);
    
    // Reload the page to apply translation
    window.location.reload();
  };

  return (
    <>
      {/* Hidden Google Translate Element */}
      <div 
        id="google_translate_element_simple" 
        style={{ display: 'none' }}
      />

      {/* Language Selector Flags */}
      <div className="flex items-center gap-2">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            className={`
              p-1 transition-all duration-200 rounded-md border-2
              ${currentLanguage === lang.code 
                ? "scale-110 opacity-100 border-primary shadow-lg" 
                : "opacity-70 hover:opacity-100 border-transparent hover:border-gray-300"
              }
            `}
            aria-label={`Switch to ${lang.name}`}
            title={lang.name}
            data-testid={`language-${lang.code}`}
          >
            <img 
              src={lang.flagUrl} 
              alt={`${lang.name} flag`}
              className="w-8 h-6 object-cover rounded"
              loading="eager"
            />
          </button>
        ))}
      </div>

      {/* Hide Google Translate banner */}
      <style>{`
        .goog-te-banner-frame {
          display: none !important;
        }
        
        body {
          top: 0 !important;
        }
        
        .skiptranslate {
          display: none !important;
        }
      `}</style>
    </>
  );
}