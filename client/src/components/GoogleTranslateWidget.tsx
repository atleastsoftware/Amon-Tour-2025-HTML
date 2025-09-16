import { useEffect, useState, useRef } from "react";
import { translationOverrideService } from "@/services/translationOverrideService";

declare global {
  interface Window {
    google: any;
    googleTranslateElementInit: () => void;
  }
}

interface Language {
  code: string;
  name: string;
  flagUrl: string;
}

const languages: Language[] = [
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

export default function GoogleTranslateWidget() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<string>("en");
  const widgetRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    // Load saved language preference
    const savedLanguage = localStorage.getItem("selectedLanguage") || "en";
    setCurrentLanguage(savedLanguage);

    // Initialize translation override service
    translationOverrideService.initialize();

    // Define the Google Translate initialization function
    window.googleTranslateElementInit = () => {
      if (!window.google?.translate?.TranslateElement) return;

      new window.google.translate.TranslateElement(
        {
          pageLanguage: "en",
          includedLanguages: "en,fr,es",
          layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
          autoDisplay: false,
          multilanguagePage: true
        },
        "google_translate_element"
      );

      setIsLoaded(true);

      // Apply saved language after widget loads
      setTimeout(() => {
        if (savedLanguage !== "en") {
          selectLanguage(savedLanguage);
        }
      }, 1000);
    };

    // Load Google Translate script
    if (!document.getElementById("google-translate-script")) {
      const script = document.createElement("script");
      script.id = "google-translate-script";
      script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      document.body.appendChild(script);
    } else {
      // Script already loaded, initialize if needed
      if (window.google?.translate?.TranslateElement) {
        window.googleTranslateElementInit();
      }
    }

    // Monitor language changes
    const checkInterval = setInterval(() => {
      const selectElement = document.querySelector(".goog-te-combo") as HTMLSelectElement;
      if (selectElement) {
        selectElement.addEventListener("change", (e) => {
          const target = e.target as HTMLSelectElement;
          const newLang = target.value || "en";
          setCurrentLanguage(newLang);
          localStorage.setItem("selectedLanguage", newLang);
          
          // Apply translation overrides after a delay
          setTimeout(() => {
            translationOverrideService.applyOverrides();
          }, 1000);
        });
        clearInterval(checkInterval);
      }
    }, 500);

    return () => {
      clearInterval(checkInterval);
    };
  }, []);

  const selectLanguage = (langCode: string) => {
    const selectElement = document.querySelector(".goog-te-combo") as HTMLSelectElement;
    if (selectElement) {
      selectElement.value = langCode;
      selectElement.dispatchEvent(new Event("change", { bubbles: true }));
      setCurrentLanguage(langCode);
      localStorage.setItem("selectedLanguage", langCode);
      
      // Apply overrides after translation
      setTimeout(() => {
        translationOverrideService.applyOverrides();
      }, 1500);
    }
  };

  const handleLanguageClick = (langCode: string) => {
    if (langCode === "en") {
      // Clear translation (go back to English)
      const frame = document.querySelector(".goog-te-banner-frame") as HTMLIFrameElement;
      if (frame && frame.contentWindow) {
        try {
          const closeButton = frame.contentWindow.document.querySelector(".goog-close-link") as HTMLElement;
          if (closeButton) {
            closeButton.click();
          }
        } catch (e) {
          // Fallback: reload page to clear translation
          const selectElement = document.querySelector(".goog-te-combo") as HTMLSelectElement;
          if (selectElement) {
            selectElement.value = "";
            selectElement.dispatchEvent(new Event("change", { bubbles: true }));
          }
        }
      }
      setCurrentLanguage("en");
      localStorage.setItem("selectedLanguage", "en");
    } else {
      selectLanguage(langCode);
    }
  };

  return (
    <>
      {/* Hidden Google Translate Widget */}
      <div 
        id="google_translate_element" 
        ref={widgetRef}
        style={{ 
          position: "absolute",
          visibility: "hidden",
          width: 0,
          height: 0,
          overflow: "hidden"
        }}
      />

      {/* Custom Flag Selector */}
      <div className="flex items-center gap-2 relative z-50" data-testid="language-switcher">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => handleLanguageClick(lang.code)}
            className={`
              relative p-1 transition-all duration-200 rounded-md border-2
              ${currentLanguage === lang.code 
                ? "scale-110 opacity-100 border-primary shadow-lg" 
                : "opacity-70 hover:opacity-100 border-transparent hover:border-gray-300"
              }
              ${!isLoaded && lang.code !== "en" ? "cursor-not-allowed grayscale" : "cursor-pointer"}
            `}
            aria-label={`Switch to ${lang.name}`}
            disabled={!isLoaded && lang.code !== "en"}
            title={lang.name}
            data-testid={`language-${lang.code}`}
            style={{ zIndex: 50 }}
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

      {/* Custom styles to hide Google Translate banner */}
      <style>{`
        /* Hide Google Translate banner */
        .goog-te-banner-frame {
          display: none !important;
        }
        
        body {
          top: 0 !important;
        }
        
        /* Hide Google Translate tooltip */
        .goog-tooltip {
          display: none !important;
        }
        
        .goog-tooltip:hover {
          display: none !important;
        }
        
        /* Hide Google branding in the widget */
        .goog-te-gadget {
          color: transparent !important;
        }
        
        .goog-te-gadget .goog-te-combo {
          display: none !important;
        }
        
        /* Remove Google Translate added margins */
        .translated-ltr {
          margin-top: 0 !important;
        }
        
        .translated-rtl {
          margin-top: 0 !important;
        }
        
        /* Hide "Powered by" text */
        .goog-te-gadget span {
          display: none !important;
        }
        
        /* Ensure no layout shift */
        .skiptranslate {
          display: none !important;
        }
        
        /* Keep only our custom flags visible */
        iframe.skiptranslate {
          display: none !important;
        }
      `}</style>
    </>
  );
}