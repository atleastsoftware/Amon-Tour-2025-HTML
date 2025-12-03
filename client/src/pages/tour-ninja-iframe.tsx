import { useEffect, useState, useMemo } from "react";
import { useLocation, useSearch } from "wouter";
import Header from "@/components/layout/Header";
import { useTranslation } from "@/contexts/TranslationContext";

// Helper function to update language in Tour Ninja URL
function updateUrlLanguage(url: string, language: string): string {
  if (!url.includes('tourninja.io')) {
    return url;
  }
  
  try {
    const urlObj = new URL(url);
    urlObj.searchParams.set('language', language);
    urlObj.searchParams.set('lang', language);
    return urlObj.toString();
  } catch {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}language=${language}&lang=${language}`;
  }
}

export default function TourNinjaIframe() {
  const [, setLocation] = useLocation();
  const searchString = useSearch();
  const { currentLanguage } = useTranslation();
  const [iframeKey, setIframeKey] = useState(0);
  
  // Parse URL parameters
  const urlParams = new URLSearchParams(searchString);
  const originalIframeUrl = urlParams.get('url');
  const titleParam = urlParams.get('title') || 'Tour Details';
  const returnUrl = urlParams.get('return') || '/experiences';
  
  // Update iframe URL when language changes
  const iframeUrl = useMemo(() => {
    if (!originalIframeUrl) return null;
    return updateUrlLanguage(originalIframeUrl, currentLanguage);
  }, [originalIframeUrl, currentLanguage]);
  
  // Force iframe reload when language changes
  useEffect(() => {
    setIframeKey(prev => prev + 1);
  }, [currentLanguage]);
  
  // Redirect if no URL provided
  useEffect(() => {
    if (!originalIframeUrl) {
      setLocation(returnUrl);
    }
  }, [originalIframeUrl, returnUrl, setLocation]);
  
  // Scroll to top and hide body scroll to prevent double scrollbar
  useEffect(() => {
    window.scrollTo(0, 0);
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);
  
  if (!originalIframeUrl || !iframeUrl) return null;
  
  return (
    <>
      <Header />
      
      <div className="min-h-screen bg-gray-50">
        {/* Iframe Container - Full height */}
        <div className="w-full">
          <iframe
            key={iframeKey}
            src={iframeUrl}
            className="w-full border-0"
            style={{ height: 'calc(100vh - 100px)', minHeight: '600px' }}
            title={titleParam}
            loading="lazy"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
          />
        </div>
      </div>
    </>
  );
}