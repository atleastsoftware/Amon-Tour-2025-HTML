import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

// Configuration i18next moderne et propre
i18n
  .use(Backend) // Charge les traductions depuis /public/locales
  .use(LanguageDetector) // Détecte automatiquement la langue
  .use(initReactI18next) // Intégration avec React
  .init({
    // Configuration des langues
    fallbackLng: 'en', // Anglais par défaut (comme demandé)
    supportedLngs: ['en', 'fr', 'es'],
    
    // Configuration debug (seulement en développement)
    debug: false, // Désactiver les logs de debug pour éviter les missingKey
    
    // Configuration pour utiliser phrases complètes comme clés
    keySeparator: false, // Permet d'utiliser des phrases avec des points comme clés
    saveMissing: false, // Ne pas enregistrer les clés manquantes
    
    // Détection automatique de la langue
    detection: {
      // Ordre de priorité pour la détection
      order: ['localStorage', 'geoLocation', 'navigator', 'htmlTag'],
      
      // Cache la sélection dans localStorage
      caches: ['localStorage'],
      
      // Configuration géolocalisation
      lookupFromPathIndex: 0,
      lookupFromSubdomainIndex: 0,
    },
    
    // Configuration Backend (chargement des fichiers)
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
    
    // Namespaces (fichiers de traduction)
    ns: ['common'],
    defaultNS: 'common',
    
    // Options React
    react: {
      useSuspense: false, // Évite les problèmes de suspense
    },
    
    // Interpolation sécurisée
    interpolation: {
      escapeValue: false, // React échappe déjà
    },
    
    // Configuration pour retourner la clé originale si pas de traduction
    returnNull: false,
    returnEmptyString: false,
    parseMissingKeyHandler: (key) => key, // Retourne la clé telle quelle si pas de traduction
  });

// Fonction pour détecter le pays via IP et rediriger automatiquement
export const detectCountryAndSetLanguage = async () => {
  try {
    // Vérifier d'abord si l'utilisateur a déjà choisi une langue
    const savedLanguage = localStorage.getItem('i18nextLng');
    if (savedLanguage && ['en', 'fr', 'es'].includes(savedLanguage)) {
      console.log('🌐 Using saved language preference:', savedLanguage);
      return;
    }

    // Géolocalisation IP pour détecter les utilisateurs francophones/hispanophones
    const response = await fetch('http://ip-api.com/json/', {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    
    if (!response.ok) {
      console.log('🌐 IP detection failed, using default language (en)');
      return;
    }
    
    const data = await response.json();
    const countryCode = data.countryCode;
    
    let targetLanguage = 'en'; // Défaut anglais
    
    // Pays francophones → français
    if (['FR', 'BE', 'CH', 'CA'].includes(countryCode)) {
      targetLanguage = 'fr';
      console.log('🇫🇷 French-speaking country detected:', countryCode, '→ switching to French');
    }
    // Pays hispanophones → espagnol  
    else if (['ES', 'MX', 'AR', 'CO', 'PE', 'VE', 'CL', 'EC', 'BO', 'PY', 'UY'].includes(countryCode)) {
      targetLanguage = 'es';
      console.log('🇪🇸 Spanish-speaking country detected:', countryCode, '→ switching to Spanish');
    }
    else {
      console.log('🇺🇸 Other country detected:', countryCode, '→ keeping English');
    }
    
    // Changer la langue si différente du défaut
    if (targetLanguage !== 'en') {
      await i18n.changeLanguage(targetLanguage);
      console.log('✅ Language automatically set to:', targetLanguage);
    }
    
  } catch (error) {
    console.log('🌐 Auto-detection failed, using default language (en):', error);
  }
};

export default i18n;