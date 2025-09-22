console.log('🔥 i18n.ts MODULE LOADING...');

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

console.log('🔥 i18n.ts IMPORTS SUCCESSFUL, about to create initializeI18n...');

// Configuration i18next ULTRA simplifiée pour debug  
const initializeI18n = () => {
  console.log('🌐 STARTING i18next initialization (ULTRA simplified)...');
  
  return i18n
    .use(Backend) // Charge les traductions depuis /public/locales
    .use(LanguageDetector) // Détecte automatiquement la langue
    .use(initReactI18next) // Intégration avec React
    .init({
      // Configuration des langues
      fallbackLng: 'en', // Anglais par défaut (comme demandé)
      supportedLngs: ['en', 'fr', 'es'],
      
      // Configuration debug pour diagnostics
      debug: true, // ACTIVER temporairement pour debug
      
      // Configuration pour utiliser phrases complètes comme clés
      keySeparator: false,
      saveMissing: false,
      
      // Détection automatique de la langue - SIMPLIFIÉ
      detection: {
        order: ['localStorage', 'navigator'],
        caches: ['localStorage'],
      },
      
      // Configuration Backend (chargement des fichiers) - AVEC LOGS DEBUG
      backend: {
        loadPath: '/locales/{{lng}}/{{ns}}.json',
        allowMultiLoading: false,
        reloadInterval: false,
        // Ajout de logs pour diagnostiquer le problème de chargement
        request: (options, url, payload, callback) => {
          console.log('🔥 i18next backend loading URL:', url);
          try {
            const xhr = new XMLHttpRequest();
            xhr.open('GET', url, true);
            xhr.onreadystatechange = () => {
              if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                  console.log('✅ i18next backend success for:', url);
                  callback(null, xhr.responseText, { status: xhr.status, statusText: xhr.statusText });
                } else {
                  console.error('❌ i18next backend failed for:', url, 'Status:', xhr.status, xhr.statusText);
                  callback(new Error(`HTTP ${xhr.status}: ${xhr.statusText}`), null, { status: xhr.status, statusText: xhr.statusText });
                }
              }
            };
            xhr.send();
          } catch (error) {
            console.error('💥 i18next backend request error:', error);
            callback(error, null, {});
          }
        }
      },
      
      // Namespaces (fichiers de traduction)
      ns: ['common'],
      defaultNS: 'common',
      fallbackNS: 'common',
      
      // Options React - SIMPLIFIÉ
      react: {
        useSuspense: false,
      },
      
      // Interpolation sécurisée
      interpolation: {
        escapeValue: false, // React échappe déjà
      },
      
      // Configuration pour retourner la clé originale si pas de traduction
      returnNull: false,
      returnEmptyString: false,
      parseMissingKeyHandler: (key) => {
        console.warn('🚨 i18next missing key:', key);
        return key;
      },
      
      // Force le chargement immédiat des traductions
      load: 'languageOnly',
      preload: ['en', 'fr', 'es'],
    })
    .then(() => {
      console.log('✅ i18next INITIALIZATION COMPLETED');
      
      // Ajouter des écouteurs d'événements pour diagnostiquer
      i18n.on('loaded', (loaded) => {
        console.log('🔥 i18next loaded event:', loaded);
      });
      
      i18n.on('failedLoading', (lng, ns, msg) => {
        console.error('❌ i18next failed loading:', lng, ns, msg);
      });
      
      i18n.on('missingKey', (lng, namespace, key, fallbackValue) => {
        console.log('🔍 i18next missing key:', lng, namespace, key);
      });
      
      // Vérifier que les traductions sont bien chargées
      const currentLng = i18n.language || 'en';
      const resources = i18n.getResourceBundle(currentLng, 'common');
      console.log('📦 Current language:', currentLng);
      console.log('📦 Resources loaded:', !!resources);
      console.log('📦 Resources content:', resources ? Object.keys(resources).slice(0, 5) : 'NONE');
      console.log('📦 Sample test (hero.title):', i18n.t('hero.title'));
      
      // Test direct de chargement d'URL
      console.log('🔥 Testing direct URL access...');
      fetch('/locales/fr/common.json')
        .then(res => {
          console.log('✅ Direct fetch status:', res.status);
          return res.json();
        })
        .then(data => {
          console.log('✅ Direct fetch data sample:', Object.keys(data).slice(0, 5));
        })
        .catch(err => {
          console.error('❌ Direct fetch failed:', err);
        });
      
      // Exposer i18next globalement pour le debug
      if (typeof window !== 'undefined') {
        (window as any).i18next = i18n;
        console.log('🌐 i18next exposed globally for debugging');
      }
      
      return i18n;
    })
    .catch((error) => {
      console.error('❌ i18next initialization FAILED:', error);
      throw error;
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