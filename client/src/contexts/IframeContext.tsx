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
    // Tour Ninja detail/presentation pages → render natively on our own translated
    // page. Tour Ninja is now a PWA that fails to load inside a cross-origin
    // sandboxed iframe (service worker + 403 responses), so we never embed it.
    const detailsMatch = originalUrl.match(/tourninja\.io\/details\/([^/?]+)/);
    if (detailsMatch) {
      setLocation(`/tour-detail/${detailsMatch[1]}`);
      return;
    }

    const url = addLanguageToTourNinjaUrl(originalUrl, currentLanguage);

    // Booking / checkout (and any other Tour Ninja flow we can't render natively)
    // must open in a new tab — these pages cannot be safely embedded.
    if (url.includes('tourninja.io')) {
      window.open(url, '_blank', 'noopener,noreferrer');
      return;
    }

    // Non-Tour Ninja URLs: keep using the in-app iframe page.
    const currentPath = location;
    const params = new URLSearchParams({
      url: url,
      title: title,
      type: 'presentation',
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