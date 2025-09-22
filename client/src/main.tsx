import { createRoot } from "react-dom/client";
import { Suspense } from "react";
import App from "./App";
import "./index.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "./components/ui/toaster";
import { ThemeProvider } from "next-themes";
import { I18nextProvider } from "react-i18next";
import i18n, { i18nInitPromise } from "./lib/i18n"; // Initialize i18next system
// import "./lib/autoTranslate"; // Auto-translation temporarily disabled due to reload loops

// Adding Font Awesome for Thai-inspired icons
const fontAwesomeLink = document.createElement("link");
fontAwesomeLink.rel = "stylesheet";
fontAwesomeLink.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css";
document.head.appendChild(fontAwesomeLink);

// Adding Google Fonts
const fontLink = document.createElement("link");
fontLink.rel = "stylesheet";
fontLink.href = "https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&family=Open+Sans:wght@400;600&family=Dancing+Script:wght@600&display=swap";
document.head.appendChild(fontLink);

// Page title will be set dynamically by i18next

// Wait for i18next to be ready before rendering
function renderApp() {
  createRoot(document.getElementById("root")!).render(
    <I18nextProvider i18n={i18n}>
      <Suspense fallback={<div>Loading translations...</div>}>
        <ThemeProvider attribute="class" defaultTheme="light">
          <QueryClientProvider client={queryClient}>
            <App />
            <Toaster />
          </QueryClientProvider>
        </ThemeProvider>
      </Suspense>
    </I18nextProvider>
  );
}

// Ensure only one render
let hasRendered = false;

function safeRender() {
  if (!hasRendered) {
    hasRendered = true;
    console.log('🚀 Rendering React app with i18next ready');
    renderApp();
  }
}

// Wait for i18next initialization and resource loading
i18nInitPromise.then(() => {
  console.log('🔧 i18next promise resolved, checking resources...');
  
  // Fonction pour vérifier si les ressources sont vraiment chargées
  const checkResources = () => {
    const currentLang = i18n.language || 'en';
    const hasResources = i18n.hasResourceBundle(currentLang, 'common');
    const testTranslation = i18n.t('hero.title');
    
    console.log('🔧 Language:', currentLang, 'Has resources:', hasResources, 'Test:', testTranslation);
    
    return hasResources && testTranslation !== 'hero.title';
  };
  
  // Si les ressources sont déjà prêtes
  if (checkResources()) {
    console.log('✅ Resources ready, rendering app immediately');
    safeRender();
  } else {
    console.log('⏳ Waiting for resources to load...');
    
    // Attendre l'événement loaded
    const onLoaded = () => {
      console.log('🔧 Loaded event received');
      if (checkResources()) {
        console.log('✅ Resources verified, rendering app');
        safeRender();
      }
    };
    
    i18n.on('loaded', onLoaded);
    
    // Backup timeout
    setTimeout(() => {
      console.log('⚠️ Timeout reached, rendering anyway');
      safeRender();
    }, 5000);
  }
}).catch((error) => {
  console.error('❌ i18next initialization failed:', error);
  safeRender();
});
