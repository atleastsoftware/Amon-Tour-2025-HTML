import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "./components/ui/toaster";
import { ThemeProvider } from "next-themes";
// import "./lib/autoTranslate"; // Auto-translation based on IP geolocation - DISABLED to fix flag conflicts

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

// Set fallback page title (React Helmet overrides this per route)
document.title = "Amon Tour | Private Krabi Tours · French & English Guides";

createRoot(document.getElementById("root")!).render(
  <ThemeProvider attribute="class" defaultTheme="light">
    <QueryClientProvider client={queryClient}>
        <App />
        <Toaster />
    </QueryClientProvider>
  </ThemeProvider>
);
