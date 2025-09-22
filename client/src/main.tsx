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

console.log('📱 Main.tsx loading - about to initialize i18next...');

// Wait for i18next initialization before rendering app
i18nInitPromise.then(() => {
  console.log('🚀 i18next ready, rendering React app...');
  renderApp();
}).catch((error) => {
  console.error('💥 i18next initialization failed, rendering app anyway:', error);
  renderApp(); // Render even if i18next fails to avoid blank page
});

console.log('📱 Main.tsx setup completed - i18nInitPromise started');
