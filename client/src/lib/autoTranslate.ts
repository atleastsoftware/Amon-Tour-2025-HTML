/**
 * Auto Translation Service
 * Automatically triggers browser native translation based on user's IP geolocation
 */

interface LocationData {
  country: string;
  countryCode: string;
  timezone: string;
}

interface TranslationConfig {
  targetLanguage: string;
  sourceLanguage: string;
  fallbackToWidget: boolean;
}

export class AutoBrowserTranslate {
  private readonly frenchCountries = ['FR', 'BE', 'CH', 'CA', 'MC', 'LU'];
  private readonly spanishCountries = ['ES', 'MX', 'AR', 'CO', 'PE', 'VE', 'CL', 'EC', 'BO', 'PY', 'UY'];
  private readonly ipApiUrl = 'https://ip-api.com/json/';
  private translationTriggered = false;

  constructor() {
    // Check if user has already made a language choice or disabled auto-translation
    const userChoice = localStorage.getItem('amon-tour-translation-choice');
    const autoTranslateDisabled = localStorage.getItem('amon-tour-disable-auto-translate');
    const userChoseManually = localStorage.getItem('user-chose-language');
    
    if (userChoice || autoTranslateDisabled || userChoseManually) {
      this.translationTriggered = true;
    }
  }

  /**
   * Initialize auto-translation detection
   */
  async init(): Promise<void> {
    // Skip if already triggered or user made manual choice or disabled auto-translation
    if (this.translationTriggered) {
      return;
    }

    // Double-check for manual language choice (in case localStorage was set after constructor)
    const userChoseManually = localStorage.getItem('user-chose-language');
    const autoTranslateDisabled = localStorage.getItem('amon-tour-disable-auto-translate');
    if (userChoseManually || autoTranslateDisabled) {
      console.log('Auto-translation disabled: User made manual language choice');
      this.translationTriggered = true;
      return;
    }

    try {
      // First check browser language preference
      const browserLang = this.getBrowserLanguage();
      if (browserLang === 'fr') {
        this.setupTranslation('fr');
        return;
      } else if (browserLang === 'es') {
        this.setupTranslation('es');
        return;
      }

      // Then check IP geolocation
      const location = await this.getLocationFromIP();
      if (this.shouldTriggerFrenchTranslation(location)) {
        this.setupTranslation('fr');
      } else if (this.shouldTriggerSpanishTranslation(location)) {
        this.setupTranslation('es');
      }
    } catch (error) {
      console.log('Auto-translation detection failed:', error);
      // Fail silently - not critical functionality
    }
  }

  /**
   * Get user's country from IP geolocation
   */
  private async getLocationFromIP(): Promise<LocationData> {
    const response = await fetch(this.ipApiUrl);
    if (!response.ok) {
      throw new Error('Failed to fetch location data');
    }
    
    const data = await response.json();
    return {
      country: data.country,
      countryCode: data.countryCode,
      timezone: data.timezone
    };
  }

  /**
   * Get browser language preference
   */
  private getBrowserLanguage(): string {
    return navigator.language?.split('-')[0]?.toLowerCase() || 'en';
  }

  /**
   * Check if we should trigger French translation
   */
  private shouldTriggerFrenchTranslation(location: LocationData): boolean {
    return this.frenchCountries.includes(location.countryCode);
  }

  /**
   * Check if we should trigger Spanish translation
   */
  private shouldTriggerSpanishTranslation(location: LocationData): boolean {
    return this.spanishCountries.includes(location.countryCode);
  }

  /**
   * Setup translation using browser native capabilities
   */
  private setupTranslation(targetLang: 'fr' | 'es'): void {
    this.translationTriggered = true;
    
    // Method 1: Set document language to trigger browser translation prompt
    document.documentElement.lang = 'en';
    document.documentElement.setAttribute('translate', 'yes');
    
    // Method 2: Add meta tags for translation hints
    this.addTranslationMetaTags(targetLang);
    
    // Method 3: Try modern browser APIs
    this.tryModernTranslationAPIs(targetLang);
    
    // Method 4: Fallback to Google Translate Widget if available
    setTimeout(() => {
      this.setupGoogleTranslateWidget(targetLang);
    }, 1000);

    // Store user's implied preference
    localStorage.setItem('amon-tour-translation-choice', `auto-detected-${targetLang}`);
  }

  /**
   * Setup French translation (backward compatibility)
   */
  private setupFrenchTranslation(): void {
    this.setupTranslation('fr');
  }

  /**
   * Add meta tags to encourage browser translation
   */
  private addTranslationMetaTags(targetLang: 'fr' | 'es'): void {
    const metaTags = [
      { name: 'google-translate-customization', content: `auto-${targetLang}` },
      { name: 'translate', content: 'yes' },
      { httpEquiv: 'content-language', content: 'en' }
    ];

    metaTags.forEach(({ name, content, httpEquiv }) => {
      const meta = document.createElement('meta');
      if (name) meta.name = name;
      if (httpEquiv) meta.httpEquiv = httpEquiv;
      meta.content = content;
      document.head.appendChild(meta);
    });
  }

  /**
   * Try modern browser translation APIs (Chrome 138+, Firefox 118+)
   */
  private async tryModernTranslationAPIs(targetLang: 'fr' | 'es'): Promise<void> {
    // Chrome Translator API (if available)
    if ('Translator' in self) {
      try {
        const translator = await (self as any).Translator.create({
          sourceLanguage: 'en',
          targetLanguage: targetLang
        });
        
        // Add subtle indicator that translation is available
        this.showTranslationIndicator('chrome', targetLang);
      } catch (error) {
        console.log('Chrome Translator API not ready:', error);
      }
    }
    
    // Firefox/Edge - rely on native detection
    if (navigator.userAgent.includes('Firefox') || navigator.userAgent.includes('Edg')) {
      this.showTranslationIndicator('native', targetLang);
    }
  }

  /**
   * Setup Google Translate Widget as fallback
   */
  private setupGoogleTranslateWidget(targetLang: 'fr' | 'es'): void {
    // Only if no native translation has been triggered
    if (!document.querySelector('.goog-te-banner-frame')) {
      const script = document.createElement('script');
      script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      
      // Create global callback
      (window as any).googleTranslateElementInit = () => {
        new (window as any).google.translate.TranslateElement({
          pageLanguage: 'en',
          includedLanguages: targetLang === 'fr' ? 'fr' : 'es',
          autoDisplay: false,
          layout: (window as any).google.translate.TranslateElement.InlineLayout.SIMPLE
        }, 'google_translate_element');
      };
      
      document.head.appendChild(script);
      
      // Create container
      const container = document.createElement('div');
      container.id = 'google_translate_element';
      container.style.display = 'none';
      document.body.appendChild(container);
    }
  }

  /**
   * Show subtle translation indicator
   */
  private showTranslationIndicator(type: 'chrome' | 'native' | 'widget', targetLang: 'fr' | 'es'): void {
    const messages = {
      fr: '🌐 Traduction française disponible',
      es: '🌐 Traducción española disponible'
    };
    
    const indicator = document.createElement('div');
    indicator.className = 'translation-indicator';
    indicator.innerHTML = `
      <div style="
        position: fixed;
        top: 10px;
        right: 10px;
        background: rgba(0, 123, 255, 0.9);
        color: white;
        padding: 8px 12px;
        border-radius: 4px;
        font-size: 12px;
        z-index: 10000;
        font-family: -apple-system, BlinkMacSystemFont, sans-serif;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        cursor: pointer;
      ">
        ${messages[targetLang]}
        <span style="margin-left: 8px; opacity: 0.7;">×</span>
      </div>
    `;
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      if (indicator.parentNode) {
        indicator.remove();
      }
    }, 5000);
    
    // Click to hide
    indicator.addEventListener('click', () => {
      indicator.remove();
      localStorage.setItem('amon-tour-translation-choice', 'dismissed');
    });
    
    document.body.appendChild(indicator);
  }

  /**
   * Manual trigger for specific language
   */
  public manualTrigger(targetLang: 'fr' | 'es' = 'fr'): void {
    this.translationTriggered = false;
    localStorage.removeItem('amon-tour-translation-choice');
    this.setupTranslation(targetLang);
  }

  /**
   * Clear all translations and restore English
   */
  public restoreEnglish(): void {
    // Remove translation attributes
    document.documentElement.removeAttribute('translate');
    document.documentElement.lang = 'en';
    
    // Remove translation meta tags
    const translationMetas = document.querySelectorAll('meta[name="google-translate-customization"], meta[name="translate"]');
    translationMetas.forEach(meta => meta.remove());
    
    // Remove Google Translate widgets
    const googleTranslateElements = document.querySelectorAll('[id*="google_translate"], .goog-te-banner-frame, .goog-te-menu-frame');
    googleTranslateElements.forEach(el => el.remove());
    
    // Clear localStorage
    localStorage.removeItem('amon-tour-translation-choice');
    
    // Reload page to restore original English
    window.location.reload();
  }
}

// Global instance
export const autoTranslate = new AutoBrowserTranslate();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    autoTranslate.init();
  });
} else {
  autoTranslate.init();
}