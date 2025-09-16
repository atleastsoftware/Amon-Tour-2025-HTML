/**
 * Translation Override Service
 * Provides custom translation corrections after Google Translate processes the page
 */

interface TranslationOverride {
  original: string | RegExp;
  replacement: string;
  languages: string[];
}

class TranslationOverrideService {
  private overrides: TranslationOverride[] = [
    // Example overrides - customize these for your specific needs
    {
      original: /Amon\s*Tour/gi,
      replacement: "Amon Tour", // Preserve brand name
      languages: ["fr", "es"]
    },
    {
      original: /Krabi\s*Celebration/gi,
      replacement: "Krabi Celebration", // Keep event names unchanged
      languages: ["fr", "es"]
    },
    // Add more overrides here as needed
    // {
    //   original: "mistranslated phrase",
    //   replacement: "correct translation",
    //   languages: ["fr"]
    // }
  ];

  private currentLanguage: string = "en";
  private observer: MutationObserver | null = null;
  private processingNodes = new WeakSet<Node>();

  /**
   * Initialize the override service
   */
  initialize() {
    this.setupTranslationListener();
    this.setupMutationObserver();
  }

  /**
   * Add custom translation override
   */
  addOverride(override: TranslationOverride) {
    this.overrides.push(override);
  }

  /**
   * Setup listener for Google Translate events
   */
  private setupTranslationListener() {
    // Listen for Google Translate language change
    const checkLanguageChange = () => {
      const googleTranslateElement = document.querySelector(".goog-te-combo") as HTMLSelectElement;
      if (googleTranslateElement) {
        googleTranslateElement.addEventListener("change", () => {
          setTimeout(() => {
            this.applyOverrides();
          }, 500); // Wait for translation to complete
        });
      }
    };

    // Check periodically until Google Translate loads
    const interval = setInterval(() => {
      if (document.querySelector(".goog-te-combo")) {
        checkLanguageChange();
        clearInterval(interval);
      }
    }, 1000);
  }

  /**
   * Setup MutationObserver to detect DOM changes
   */
  private setupMutationObserver() {
    this.observer = new MutationObserver((mutations) => {
      // Debounce to avoid too many calls
      if (this.isTranslating()) {
        setTimeout(() => {
          this.applyOverridesToMutations(mutations);
        }, 100);
      }
    });

    // Start observing when ready
    setTimeout(() => {
      this.observer?.observe(document.body, {
        childList: true,
        subtree: true,
        characterData: true,
        characterDataOldValue: true
      });
    }, 2000);
  }

  /**
   * Check if Google Translate is active
   */
  private isTranslating(): boolean {
    return document.documentElement.classList.contains("translated-ltr") ||
           document.documentElement.classList.contains("translated-rtl");
  }

  /**
   * Get current selected language
   */
  private getCurrentLanguage(): string {
    const googleTranslateElement = document.querySelector(".goog-te-combo") as HTMLSelectElement;
    if (googleTranslateElement && googleTranslateElement.value) {
      return googleTranslateElement.value;
    }
    // Check HTML lang attribute as fallback
    const htmlLang = document.documentElement.getAttribute("lang");
    return htmlLang ? htmlLang.split("-")[0] : "en";
  }

  /**
   * Apply overrides to specific mutations
   */
  private applyOverridesToMutations(mutations: MutationRecord[]) {
    const currentLang = this.getCurrentLanguage();
    if (currentLang === "en") return; // No overrides for English

    mutations.forEach(mutation => {
      if (mutation.type === "characterData" && mutation.target.nodeValue) {
        const node = mutation.target;
        if (!this.processingNodes.has(node)) {
          this.processingNodes.add(node);
          this.applyOverridesToNode(node, currentLang);
        }
      } else if (mutation.type === "childList") {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === Node.TEXT_NODE && !this.processingNodes.has(node)) {
            this.processingNodes.add(node);
            this.applyOverridesToNode(node, currentLang);
          }
        });
      }
    });
  }

  /**
   * Apply all overrides to the page
   */
  applyOverrides() {
    const currentLang = this.getCurrentLanguage();
    if (currentLang === "en") return;

    console.log(`Applying translation overrides for language: ${currentLang}`);
    
    // Process all text nodes
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: (node) => {
          // Skip script and style tags
          const parent = node.parentElement;
          if (parent && (parent.tagName === "SCRIPT" || parent.tagName === "STYLE")) {
            return NodeFilter.FILTER_REJECT;
          }
          return NodeFilter.FILTER_ACCEPT;
        }
      }
    );

    const textNodes: Node[] = [];
    let node;
    while (node = walker.nextNode()) {
      textNodes.push(node);
    }

    textNodes.forEach(node => {
      this.applyOverridesToNode(node, currentLang);
    });
  }

  /**
   * Apply overrides to a specific text node
   */
  private applyOverridesToNode(node: Node, language: string) {
    if (!node.nodeValue) return;

    let text = node.nodeValue;
    let modified = false;

    this.overrides.forEach(override => {
      // Check if this override applies to the current language
      if (override.languages.includes(language)) {
        const oldText = text;
        if (override.original instanceof RegExp) {
          text = text.replace(override.original, override.replacement);
        } else {
          // Case-insensitive replacement for strings
          const regex = new RegExp(override.original.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
          text = text.replace(regex, override.replacement);
        }
        if (oldText !== text) {
          modified = true;
        }
      }
    });

    if (modified && node.nodeValue !== text) {
      node.nodeValue = text;
    }
  }

  /**
   * Clean up resources
   */
  destroy() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }
}

// Export singleton instance
export const translationOverrideService = new TranslationOverrideService();