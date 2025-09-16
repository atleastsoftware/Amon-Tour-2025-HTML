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
  const [isLoading, setIsLoading] = useState(false);

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

    // Check if Google Translate is already loaded to avoid conflicts
    const existingScript = document.querySelector('script[src*="translate.google.com"]');
    if (existingScript && window.google?.translate) {
      console.log("Google Translate already loaded, skipping initialization");
      return;
    }

    // Initialize Google Translate only if not already present
    if (!existingScript) {
      const script = document.createElement("script");
      script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      script.id = "google-translate-simple-script";
      
      // Define initialization function with unique name to avoid conflicts
      window.googleTranslateElementInit = () => {
        if (window.google?.translate?.TranslateElement) {
          try {
            new window.google.translate.TranslateElement(
              {
                pageLanguage: "en",
                includedLanguages: "en,fr,es",
                layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
                autoDisplay: false
              },
              "google_translate_element_simple"
            );
            console.log("SimpleTranslateWidget: Google Translate initialized successfully");
          } catch (error) {
            console.error("SimpleTranslateWidget: Error initializing Google Translate", error);
          }
        }
      };

      document.body.appendChild(script);
    }

    return () => {
      // Cleanup - only remove our specific script
      const ourScript = document.getElementById("google-translate-simple-script");
      if (ourScript) {
        ourScript.remove();
      }
    };
  }, []);

  const handleLanguageChange = (langCode: string) => {
    if (isLoading) return; // Prevent multiple clicks during loading
    
    setIsLoading(true);
    console.log(`SimpleTranslateWidget: Switching to language ${langCode}`);
    
    // Set the cookie
    const expires = new Date();
    expires.setFullYear(expires.getFullYear() + 1);
    
    // Clear any existing translation cookies first
    document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    
    if (langCode === "en") {
      // Clear translation
      document.cookie = `googtrans=/en/en; path=/; expires=${expires.toUTCString()}`;
    } else {
      // Set translation
      document.cookie = `googtrans=/en/${langCode}; path=/; expires=${expires.toUTCString()}`;
    }
    
    setCurrentLanguage(langCode);
    
    // Add a small delay before reload to ensure cookie is set
    setTimeout(() => {
      window.location.reload();
    }, 100);
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
            disabled={isLoading}
            className={`
              p-1 transition-all duration-200 rounded-md border-2 relative
              ${currentLanguage === lang.code 
                ? "scale-110 opacity-100 border-primary shadow-lg" 
                : "opacity-70 hover:opacity-100 border-transparent hover:border-gray-300"
              }
              ${isLoading ? "cursor-not-allowed" : "cursor-pointer"}
            `}
            aria-label={`Switch to ${lang.name}`}
            title={lang.name}
            data-testid={`language-${lang.code}`}
          >
            <img 
              src={lang.flagUrl} 
              alt={`${lang.name} flag`}
              className={`w-8 h-6 object-cover rounded ${isLoading ? "grayscale" : ""}`}
              loading="eager"
              onError={(e) => {
                console.warn(`SimpleTranslateWidget: Failed to load flag for ${lang.name}:`, lang.flagUrl);
                // Fallback: show text instead of flag
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                target.parentElement!.innerHTML += `<span class="text-xs font-bold">${lang.code.toUpperCase()}</span>`;
              }}
            />
            {isLoading && currentLanguage === lang.code && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded">
                <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
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