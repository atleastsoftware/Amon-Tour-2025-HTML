import { createContext, useContext, useState, ReactNode } from 'react';
import { useLocation } from 'wouter';
import { useTranslation } from './TranslationContext';

interface IframeContextType {
  isOpen: boolean;
  url: string;
  title: string;
  openIframe: (url: string, title: string) => void;
  closeIframe: () => void;
}

const IframeContext = createContext<IframeContextType | undefined>(undefined);

// Helper function to add language parameter to Tour Ninja URLs
function addLanguageToTourNinjaUrl(url: string, language: string): string {
  // Only modify Tour Ninja URLs
  if (!url.includes('tourninja.io')) {
    return url;
  }
  
  try {
    const urlObj = new URL(url);
    // Add or update the language parameter
    urlObj.searchParams.set('language', language);
    // Also try common alternatives that Tour Ninja might support
    urlObj.searchParams.set('lang', language);
    return urlObj.toString();
  } catch {
    // If URL parsing fails, append manually
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}language=${language}&lang=${language}`;
  }
}

export function IframeProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [location, setLocation] = useLocation();
  const { currentLanguage } = useTranslation();

  const openIframe = (originalUrl: string, title: string) => {
    // Add language parameter to Tour Ninja URLs
    const url = addLanguageToTourNinjaUrl(originalUrl, currentLanguage);

    // Determine iframe type based on URL content
    const isBooking = url.includes('book') || url.includes('checkout') || url.includes('reserve');
    const iframeType = isBooking ? 'booking' : 'presentation';

    // Embed the Tour Ninja page (presentation / details / booking) in our iframe page.
    const currentPath = location;
    const params = new URLSearchParams({
      url: url,
      title: title,
      type: iframeType,
      return: currentPath,
    });
    setLocation(`/tour-ninja-iframe?${params.toString()}`);
  };

  const closeIframe = () => {
    setIsOpen(false);
    setUrl('');
    setTitle('');
  };

  return (
    <IframeContext.Provider value={{
      isOpen,
      url,
      title,
      openIframe,
      closeIframe
    }}>
      {children}
    </IframeContext.Provider>
  );
}

export function useIframe() {
  const context = useContext(IframeContext);
  if (context === undefined) {
    throw new Error('useIframe must be used within an IframeProvider');
  }
  return context;
}