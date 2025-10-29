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
  private readonly ipApiUrl = 'https://ip-api.com/json/';
  private translationTriggered = false;

  constructor() {
    // Check if user has already made a language choice
    const userChoice = localStorage.getItem('amon-tour-translation-choice');
    if (userChoice) {
      this.translationTriggered = true;
    }
  }

  /**
   * Initialize auto-translation detection
   */
  async init(): Promise<void> {
    if (this.translationTriggered) {
      return;
    }

    try {
      // First check browser language preference
      const browserLang = this.getBrowserLanguage();
      if (browserLang === 'fr') {
        this.setupFrenchTranslation();
        return;
      }

      // Then check IP geolocation
      const location = await this.getLocationFromIP();
      if (this.shouldTriggerFrenchTranslation(location)) {
        this.setupFrenchTranslation();
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
   * Setup French translation using browser native capabilities
   */
  private setupFrenchTranslation(): void {
    this.translationTriggered = true;
    
    // Method 1: Set document language to trigger browser translation prompt
    document.documentElement.lang = 'en';
    document.documentElement.setAttribute('translate', 'yes');
    
    // Method 2: Add meta tags for translation hints
    this.addTranslationMetaTags();
    
    // Method 3: Try modern browser APIs
    this.tryModernTranslationAPIs();
    
    // Method 4: Fallback to Google Translate Widget if available
    setTimeout(() => {
      this.setupGoogleTranslateWidget();
    }, 1000);

    // Store user's implied preference
    localStorage.setItem('amon-tour-translation-choice', 'auto-detected');
  }

  /**
   * Add meta tags to encourage browser translation
   */
  private addTranslationMetaTags(): void {
    const metaTags = [
      { name: 'google-translate-customization', content: 'auto-french' },
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
  private async tryModernTranslationAPIs(): Promise<void> {
    // Chrome Translator API (if available)
    if ('Translator' in self) {
      try {
        const translator = await (self as any).Translator.create({
          sourceLanguage: 'en',
          targetLanguage: 'fr'
        });
        
        // Add subtle indicator that translation is available
        this.showTranslationIndicator('chrome');
      } catch (error) {
        console.log('Chrome Translator API not ready:', error);
      }
    }
    
    // Firefox/Edge - rely on native detection
    if (navigator.userAgent.includes('Firefox') || navigator.userAgent.includes('Edg')) {
      this.showTranslationIndicator('native');
    }
  }

  /**
   * Setup Google Translate Widget as fallback
   */
  private setupGoogleTranslateWidget(): void {
    // Only if no native translation has been triggered
    if (!document.querySelector('.goog-te-banner-frame')) {
      const script = document.createElement('script');
      script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      
      // Create global callback
      (window as any).googleTranslateElementInit = () => {
        new (window as any).google.translate.TranslateElement({
          pageLanguage: 'en',
          includedLanguages: 'fr',
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
  private showTranslationIndicator(type: 'chrome' | 'native' | 'widget'): void {
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
        🌐 Traduction française disponible
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
   * Manual trigger for testing
   */
  public manualTrigger(): void {
    this.translationTriggered = false;
    localStorage.removeItem('amon-tour-translation-choice');
    this.setupFrenchTranslation();
  }
}

// Global instance
export const autoTranslate = new AutoBrowserTranslate();

// Auto-initialize when DOM is ready
// DISABLED: Auto-translate conflicts with Google Translate API implementation
// if (document.readyState === 'loading') {
//   document.addEventListener('DOMContentLoaded', () => {
//     autoTranslate.init();
//   });
// } else {
//   autoTranslate.init();
// }