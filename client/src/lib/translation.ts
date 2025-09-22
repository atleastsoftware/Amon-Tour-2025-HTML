// Helper global pour accéder directement aux traductions
// Contourne le problème avec useTranslation() qui ne fonctionne pas

export const t = (key: string): string => {
  const i18nInstance = (window as any).i18next;
  if (i18nInstance && i18nInstance.isInitialized) {
    const translation = i18nInstance.t(key);
    return translation;
  }
  return key; // Fallback si i18next n'est pas prêt
};

// Helper pour obtenir la langue actuelle
export const getCurrentLanguage = (): string => {
  const i18nInstance = (window as any).i18next;
  return i18nInstance?.language || 'en';
};

// Helper pour changer de langue
export const changeLanguage = async (lng: string): Promise<void> => {
  const i18nInstance = (window as any).i18next;
  if (i18nInstance) {
    await i18nInstance.changeLanguage(lng);
  }
};