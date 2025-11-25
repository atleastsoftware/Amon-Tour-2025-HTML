import { useTranslation } from '../contexts/TranslationContext';

export function useAdminTranslation() {
  const { translations, currentLanguage, setLanguage, isChangingLanguage } = useTranslation();
  
  const adminTranslations = translations?.admin || {};
  
  return {
    t: adminTranslations,
    language: currentLanguage,
    setLanguage,
    isChangingLanguage
  };
}
