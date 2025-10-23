// Hook wrapper pour faciliter l'utilisation des traductions
// Compatible avec l'ancien système tout en utilisant le nouveau contexte

import { useTranslation } from '../contexts/TranslationContext';

export function useTranslations() {
  const { translations, currentLanguage, setLanguage, isChangingLanguage } = useTranslation();
  
  return {
    // Méthodes pour obtenir des sections spécifiques
    getNav: () => translations.nav,
    getHero: () => translations.hero,
    getCommon: () => translations.common,
    getTours: () => translations.tours,
    getHome: () => translations.home,
    getFooter: () => translations.footer,
    getCruise: () => translations.cruise,
    getCustomTour: () => translations.customTour,
    getSeo: () => translations.seo,
    
    // Méthode générale de traduction
    translate: (keyPath: string): string => {
      const keys = keyPath.split('.');
      let value: any = translations;
      
      for (const key of keys) {
        if (value && typeof value === 'object' && key in value) {
          value = value[key];
        } else {
          return keyPath;
        }
      }
      
      return typeof value === 'string' ? value : keyPath;
    },
    
    // État et contrôle
    currentLanguage,
    setLanguage,
    isChangingLanguage
  };
}