import { useTranslation } from 'react-i18next';
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
const languages: Language[] = [{
  code: "en",
  name: t('English', {
    defaultValue: 'English'
  }),
  flagUrl: "https://flagcdn.com/w40/gb.png"
}, {
  code: "fr",
  name: t('Fran\xE7ais', {
    defaultValue: 'Fran\xE7ais'
  }),
  flagUrl: "https://flagcdn.com/w40/fr.png"
}, {
  code: "es",
  name: t('Espa\xF1ol', {
    defaultValue: 'Espa\xF1ol'
  }),
  flagUrl: "https://flagcdn.com/w40/es.png"
}];
export default function GoogleTranslateWidget() {
  const { t } = useTranslation();

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
      console.log("Google Translate Widget initializing...");
      if (!window.google?.translate?.TranslateElement) {
        console.error("Google Translate not loaded");
        return;
      }
      new window.google.translate.TranslateElement({
        pageLanguage: "en",
        includedLanguages: "en,fr,es",
        layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
        autoDisplay: false,
        multilanguagePage: true
      }, "google_translate_element");
      console.log("Google Translate Widget initialized");
      setIsLoaded(true);

      // Don't apply saved language automatically - the cookie handles it
    };

    // Load Google Translate script
    if (!document.getElementById("google-translate-script")) {
      const script = document.createElement("script");
      script.id = "google-translate-script";
      script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      document.body.appendChild(script);
      console.log("Loading Google Translate script...");
    } else {
      // Script already loaded, initialize if needed
      if (window.google?.translate?.TranslateElement) {
        window.googleTranslateElementInit();
      }
    }

    // Monitor for widget ready and apply saved language
    let retryCount = 0;
    const checkInterval = setInterval(() => {
      const selectElement = document.querySelector(".goog-te-combo") as HTMLSelectElement;
      const googleBranding = document.querySelector(".goog-te-gadget");
      if (selectElement) {
        console.log("Google Translate select element found!");
        setIsLoaded(true);

        // Apply saved language if it's not English
        if (savedLanguage !== "en" && selectElement.value !== savedLanguage) {
          console.log(`Applying saved language: ${savedLanguage}`);
          selectElement.value = savedLanguage;
          selectElement.dispatchEvent(new Event("change", {
            bubbles: true
          }));
        }

        // Listen for manual changes
        selectElement.addEventListener("change", e => {
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
      } else if (googleBranding) {
        // Widget is loaded but select might be inside an iframe
        console.log("Google Translate widget detected (branding visible)");
        setIsLoaded(true);
        // Don't clear interval yet, keep looking for select element
      }
      retryCount++;
      if (retryCount > 20) {
        console.log("Google Translate setup complete");
        setIsLoaded(true);
        clearInterval(checkInterval);
      }
    }, 500);
    return () => {
      clearInterval(checkInterval);
    };
  }, []);
  const selectLanguage = (langCode: string) => {
    console.log(`Attempting to select language: ${langCode}`);

    // Try using the select element (if it exists)
    const selectElement = document.querySelector(".goog-te-combo") as HTMLSelectElement;
    if (selectElement) {
      console.log(`Found select element, setting to: ${langCode}`);
      selectElement.value = langCode;
      selectElement.dispatchEvent(new Event("change", {
        bubbles: true
      }));
      setCurrentLanguage(langCode);
      localStorage.setItem("selectedLanguage", langCode);

      // Apply overrides after translation
      setTimeout(() => {
        translationOverrideService.applyOverrides();
      }, 1500);
    } else {
      console.log("Select element not found, language will be applied via cookie on reload");
    }
  };
  const handleLanguageClick = (langCode: string) => {
    console.log(`Language button clicked: ${langCode}`);

    // Save the selection
    setCurrentLanguage(langCode);
    localStorage.setItem("selectedLanguage", langCode);

    // Method 1: Try using the hidden select element if it exists
    const selectElement = document.querySelector(".goog-te-combo") as HTMLSelectElement;
    if (selectElement) {
      console.log("Using Google Translate select element");
      if (langCode === "en") {
        selectElement.value = "";
      } else {
        selectElement.value = langCode;
      }
      selectElement.dispatchEvent(new Event("change", {
        bubbles: true
      }));

      // Apply translation overrides after a delay
      setTimeout(() => {
        translationOverrideService.applyOverrides();
      }, 1500);
    } else {
      // Method 2: Use cookie and reload (fallback)
      console.log("Google Translate select not found, using cookie method");

      // Clear any existing cookies first
      document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

      // Set new cookie value
      if (langCode === "en") {
        document.cookie = "googtrans=/en/en; path=/;";
      } else {
        document.cookie = `googtrans=/en/${langCode}; path=/;`;
      }

      // Force reload to apply translation
      setTimeout(() => {
        window.location.reload();
      }, 100);
    }
  };
  return <>
      {/* Hidden Google Translate Widget */}
      <div id="google_translate_element" ref={widgetRef} style={{
      position: "absolute",
      visibility: "hidden",
      width: 0,
      height: 0,
      overflow: "hidden"
    }} />

      {/* Custom Flag Selector */}
      <div className="flex items-center gap-2 relative z-50" data-testid="language-switcher">
        {languages.map(lang => <button key={lang.code} onClick={() => handleLanguageClick(lang.code)} className={`
              relative p-1 transition-all duration-200 rounded-md border-2
              ${currentLanguage === lang.code ? "scale-110 opacity-100 border-primary shadow-lg" : "opacity-70 hover:opacity-100 border-transparent hover:border-gray-300"}
              ${!isLoaded && lang.code !== "en" ? "cursor-not-allowed grayscale" : "cursor-pointer"}
            `} aria-label={`Switch to ${lang.name}`} disabled={!isLoaded && lang.code !== "en"} title={lang.name} data-testid={`language-${lang.code}`} style={{
        zIndex: 50
      }}>
            <img src={lang.flagUrl} alt={`${lang.name} flag`} className="w-8 h-6 object-cover rounded" loading="eager" />
          </button>)}
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
    </>;
}