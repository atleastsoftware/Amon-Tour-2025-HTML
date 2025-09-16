// Translation Service - Système de traduction statique pour remplacer Google Translate
// Translations pour les éléments principaux du site Amon Tour

export interface Translations {
  // Navigation
  nav: {
    experiences: string;
    cruise: string;
    customTrip: string;
    blog: string;
    contact: string;
  };
  // Hero Section
  hero: {
    title: string;
    subtitle: string;
    thailand: string;
    description: string;
    seeOffers: string;
    customTrip: string;
  };
  // Common elements
  common: {
    loading: string;
    error: string;
    tryAgain: string;
    learnMore: string;
    viewDetails: string;
    bookNow: string;
  };
  // Tours page
  tours: {
    title: string;
    description: string;
    duration: string;
    participants: string;
    price: string;
    featured: string;
  };
  // Footer
  footer: {
    aboutUs: string;
    followUs: string;
    contact: string;
    privacyPolicy: string;
    terms: string;
  };
}

const translations: Record<string, Translations> = {
  en: {
    nav: {
      experiences: "Experiences",
      cruise: "Cruise",
      customTrip: "Custom Trip",
      blog: "Blog",
      contact: "Contact"
    },
    hero: {
      title: "Your exclusive experiences",
      subtitle: "in Krabi",
      thailand: "THAILAND",
      description: "Discover amazing places away from mass tourism in Krabi. And also Khao Sok, Koh Mook and many more destinations.",
      seeOffers: "See our offers",
      customTrip: "Custom your trip"
    },
    common: {
      loading: "Loading...",
      error: "Error",
      tryAgain: "Try again",
      learnMore: "Learn more",
      viewDetails: "View details",
      bookNow: "Book now"
    },
    tours: {
      title: "Tours & Experiences",
      description: "Explore our curated selection of unique experiences in Thailand",
      duration: "Duration",
      participants: "Max participants", 
      price: "From",
      featured: "Featured Tours"
    },
    footer: {
      aboutUs: "About Us",
      followUs: "Follow Us",
      contact: "Contact",
      privacyPolicy: "Privacy Policy", 
      terms: "Terms & Conditions"
    }
  },
  fr: {
    nav: {
      experiences: "Expériences",
      cruise: "Croisière",
      customTrip: "Voyage Sur Mesure",
      blog: "Blog",
      contact: "Contact"
    },
    hero: {
      title: "Vos expériences exclusives",
      subtitle: "à Krabi",
      thailand: "THAÏLANDE",
      description: "Découvrez des lieux extraordinaires loin du tourisme de masse à Krabi. Ainsi que Khao Sok, Koh Mook et bien d'autres destinations.",
      seeOffers: "Voir nos offres",
      customTrip: "Personnalisez votre voyage"
    },
    common: {
      loading: "Chargement...",
      error: "Erreur",
      tryAgain: "Réessayer",
      learnMore: "En savoir plus",
      viewDetails: "Voir les détails",
      bookNow: "Réserver"
    },
    tours: {
      title: "Tours & Expériences",
      description: "Explorez notre sélection d'expériences uniques en Thaïlande",
      duration: "Durée",
      participants: "Participants max",
      price: "À partir de",
      featured: "Tours Vedettes"
    },
    footer: {
      aboutUs: "À Propos",
      followUs: "Suivez-Nous",
      contact: "Contact",
      privacyPolicy: "Politique de Confidentialité",
      terms: "Conditions Générales"
    }
  },
  es: {
    nav: {
      experiences: "Experiencias",
      cruise: "Crucero",
      customTrip: "Viaje Personalizado",
      blog: "Blog",
      contact: "Contacto"
    },
    hero: {
      title: "Tus experiencias exclusivas",
      subtitle: "en Krabi",
      thailand: "TAILANDIA", 
      description: "Descubre lugares increíbles lejos del turismo masivo en Krabi. Y también Khao Sok, Koh Mook y muchos más destinos.",
      seeOffers: "Ver nuestras ofertas",
      customTrip: "Personaliza tu viaje"
    },
    common: {
      loading: "Cargando...",
      error: "Error",
      tryAgain: "Intentar de nuevo",
      learnMore: "Saber más",
      viewDetails: "Ver detalles",
      bookNow: "Reservar"
    },
    tours: {
      title: "Tours y Experiencias",
      description: "Explora nuestra selección de experiencias únicas en Tailandia",
      duration: "Duración",
      participants: "Participantes máx",
      price: "Desde",
      featured: "Tours Destacados"
    },
    footer: {
      aboutUs: "Acerca de Nosotros",
      followUs: "Síguenos",
      contact: "Contacto",
      privacyPolicy: "Política de Privacidad",
      terms: "Términos y Condiciones"
    }
  }
};

export class TranslationService {
  private currentLanguage: string = 'en';
  
  constructor() {
    // Load saved language from localStorage
    const savedLanguage = localStorage.getItem('preferred-language');
    if (savedLanguage && translations[savedLanguage]) {
      this.currentLanguage = savedLanguage;
    }
  }

  getCurrentLanguage(): string {
    return this.currentLanguage;
  }

  setLanguage(language: string): boolean {
    if (translations[language]) {
      this.currentLanguage = language;
      localStorage.setItem('preferred-language', language);
      return true;
    }
    return false;
  }

  getTranslations(): Translations {
    return translations[this.currentLanguage] || translations.en;
  }

  // Helper methods for specific sections
  getNav() {
    return this.getTranslations().nav;
  }

  getHero() {
    return this.getTranslations().hero;
  }

  getCommon() {
    return this.getTranslations().common;
  }

  getTours() {
    return this.getTranslations().tours;
  }

  getFooter() {
    return this.getTranslations().footer;
  }

  // Method to translate a specific key path
  translate(keyPath: string): string {
    const keys = keyPath.split('.');
    let value: any = this.getTranslations();
    
    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        // Return the key if translation not found
        return keyPath;
      }
    }
    
    return typeof value === 'string' ? value : keyPath;
  }
}

// Create global translation service instance
export const translationService = new TranslationService();
export const t = (key: string) => translationService.translate(key);