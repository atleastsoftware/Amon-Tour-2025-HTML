/**
 * Auto Translation Service
 * Automatically triggers i18next language change based on user's IP geolocation
 */

import i18n from 'i18next';

interface LocationData {
  country: string;
  countryCode: string;
  timezone: string;
}

export class AutoI18nTranslate {
  private readonly frenchCountries = ['FR', 'BE', 'CH', 'CA', 'MC', 'LU'];
  private readonly spanishCountries = ['ES', 'MX', 'AR', 'CO', 'PE', 'VE', 'CL', 'EC', 'BO', 'PY', 'UY'];
  private readonly ipApiUrl = 'https://ip-api.com/json/';
  private translationTriggered = false;

  constructor() {
    // Check if user has already made a language choice or disabled auto-translation
    const userChoice = localStorage.getItem('user-chose-language');
    const autoTranslateDisabled = localStorage.getItem('amon-tour-disable-auto-translate');
    const savedLang = localStorage.getItem('i18nextLng');
    
    if (userChoice || autoTranslateDisabled || (savedLang && savedLang !== 'en')) {
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
        await this.setupTranslation('fr');
        this.showTranslationIndicator('fr');
        return;
      } else if (browserLang === 'es') {
        await this.setupTranslation('es');
        this.showTranslationIndicator('es');
        return;
      }

      // Then check IP geolocation
      const location = await this.getLocationFromIP();
      if (this.shouldTriggerFrenchTranslation(location)) {
        await this.setupTranslation('fr');
        this.showTranslationIndicator('fr');
      } else if (this.shouldTriggerSpanishTranslation(location)) {
        await this.setupTranslation('es');
        this.showTranslationIndicator('es');
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
   * Setup translation using i18next
   */
  private async setupTranslation(targetLang: 'fr' | 'es'): Promise<void> {
    this.translationTriggered = true;
    
    try {
      // Change language using i18next
      await i18n.changeLanguage(targetLang);
      
      // Store user's implied preference
      localStorage.setItem('amon-tour-translation-choice', `auto-detected-${targetLang}`);
      
      console.log(`🌐 Auto-detected language switched to: ${targetLang}`);
      
    } catch (error) {
      console.error('Failed to auto-switch language:', error);
      // Fallback to English if translation fails
      await i18n.changeLanguage('en');
    }
  }

  /**
   * Show subtle translation indicator
   */
  private showTranslationIndicator(targetLang: 'fr' | 'es'): void {
    const messages = {
      fr: '🌐 Traduction française détectée automatiquement',
      es: '🌐 Traducción española detectada automáticamente'
    };
    
    const indicator = document.createElement('div');
    indicator.className = 'translation-indicator';
    indicator.innerHTML = `
      <div style="
        position: fixed;
        top: 10px;
        right: 10px;
        background: rgba(30, 115, 190, 0.95);
        color: white;
        padding: 8px 12px;
        border-radius: 6px;
        font-size: 12px;
        z-index: 10000;
        font-family: -apple-system, BlinkMacSystemFont, sans-serif;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        cursor: pointer;
        transition: opacity 0.3s ease;
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
  public async manualTrigger(targetLang: 'fr' | 'es' = 'fr'): Promise<void> {
    this.translationTriggered = false;
    localStorage.removeItem('amon-tour-translation-choice');
    await this.setupTranslation(targetLang);
  }

  /**
   * Clear all translations and restore English
   */
  public async restoreEnglish(): Promise<void> {
    try {
      // Switch back to English using i18next
      await i18n.changeLanguage('en');
      
      // Clear localStorage
      localStorage.removeItem('amon-tour-translation-choice');
      
      console.log('🌐 Language restored to English');
      
    } catch (error) {
      console.error('Failed to restore English:', error);
      // Fallback: reload page
      window.location.reload();
    }
  }
}

// Global instance
export const autoTranslate = new AutoI18nTranslate();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    autoTranslate.init();
  });
} else {
  autoTranslate.init();
}