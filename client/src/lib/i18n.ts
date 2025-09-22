import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

// Configuration i18next avec force refresh des ressources
const initializeI18n = () => {
  return i18n
    .use(Backend)
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      // Configuration des langues
      fallbackLng: 'en',
      supportedLngs: ['en', 'fr', 'es'],
      
      // Configuration debug pour diagnostics
      debug: true,
      
      // Configuration pour utiliser phrases complètes comme clés
      keySeparator: false,
      saveMissing: false,
      
      // Détection automatique de la langue
      detection: {
        order: ['localStorage', 'navigator'],
        caches: ['localStorage'],
      },
      
      // Configuration Backend avec le bon chemin serveur
      backend: {
        loadPath: '/api-locales/{{lng}}/{{ns}}.json',
        allowMultiLoading: false,
        reloadInterval: false,
        // Timeout plus long pour s'assurer du chargement
        requestOptions: {
          cache: 'no-cache', // Force fresh load
        },
      },
      
      // Namespaces
      ns: ['common'],
      defaultNS: 'common',
      fallbackNS: 'common',
      
      // Options React - CRITIQUE pour la liaison
      react: {
        useSuspense: false,
        bindI18n: 'languageChanged loaded',
        bindI18nStore: 'added removed',
        // Force update des composants React
        transEmptyNodeValue: '',
        transSupportBasicHtmlNodes: true,
      },
      
      // Interpolation sécurisée
      interpolation: {
        escapeValue: false,
      },
      
      // Configuration pour retourner la clé si pas de traduction
      returnNull: false,
      returnEmptyString: false,
      
      // Force le chargement synchrone des 3 langues
      load: 'languageOnly',
      preload: ['en', 'fr', 'es'],
    })
    .then(() => {
      console.log('✅ i18next initialized successfully');
      
      // Force le rechargement des ressources pour la langue courante
      const currentLng = i18n.language || 'en';
      console.log('🔧 Current language:', currentLng);
      
      // Tester immédiatement la traduction
      const testTranslation = i18n.t('hero.title');
      console.log('🔧 Test translation hero.title:', testTranslation);
      
      // Force refresh des ressources React
      i18n.emit('loaded', {});
      
      return i18n;
    });
};

// Exporter la promesse d'initialisation
export const i18nInitPromise = initializeI18n();

export default i18n;

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