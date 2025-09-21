// MINIMAL TRANSLATION SERVICE - PREVENTS IMPORT ERRORS
// This provides empty methods for pages not yet migrated to i18next
// Main homepage components are fully migrated to i18next

class TranslationService {
  getHome() {
    return {};
  }

  getHero() {
    return {};
  }

  getCruise() {
    return {};
  }

  getSeo() {
    return {
      defaultTitle: "Amon Tour",
      defaultDescription: "Authentic Krabi Experiences", 
      defaultKeywords: "krabi tours, thailand travel"
    };
  }

  getNav() {
    return {};
  }

  getFooter() {
    return {};
  }

  getButtons() {
    return {};
  }
}

export const translationService = new TranslationService();