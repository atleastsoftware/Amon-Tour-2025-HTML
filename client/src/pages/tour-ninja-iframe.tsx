import { useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import Header from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import logoAmon from "@/assets/logo-amon.png";
import { useTranslation } from "@/contexts/TranslationContext";

export default function TourNinjaIframe() {
  const [, setLocation] = useLocation();
  const searchString = useSearch();
  const { translations } = useTranslation();
  
  const t = translations.tourNinjaIframe || {};
  const common = translations.common || {};
  
  // Parse URL parameters
  const urlParams = new URLSearchParams(searchString);
  const iframeUrl = urlParams.get('url');
  const titleParam = urlParams.get('title') || 'Tour Details';
  const titleType = urlParams.get('type') || 'presentation';
  const returnUrl = urlParams.get('return') || '/experiences';
  
  // Get translated title prefix based on type
  const titlePrefix = titleType === 'booking' 
    ? (t.booking || 'Booking') 
    : (t.presentation || 'Presentation');
  const title = `${titlePrefix} - ${titleParam}`;
  
  // Redirect if no URL provided
  useEffect(() => {
    if (!iframeUrl) {
      setLocation(returnUrl);
    }
  }, [iframeUrl, returnUrl, setLocation]);
  
  // Scroll to top and hide body scroll to prevent double scrollbar
  useEffect(() => {
    window.scrollTo(0, 0);
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);
  
  if (!iframeUrl) return null;
  
  return (
    <>
      <Header />
      
      <div className="min-h-screen bg-gray-50">
        {/* Info Bar */}
        <div className="bg-white border-b shadow-sm">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1 mr-4">
                <img 
                  src={logoAmon} 
                  alt="Amon Logo" 
                  className="h-8 w-auto"
                />
                <h2 className="text-lg font-semibold text-gray-800 truncate">
                  {title}
                </h2>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLocation(returnUrl)}
                className="hover:bg-gray-100"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                {common.back || 'Back'}
              </Button>
            </div>
          </div>
        </div>
        
        {/* Iframe Container - Full height without footer to avoid double scrollbar */}
        <div className="w-full">
          <iframe
            src={iframeUrl}
            className="w-full border-0"
            style={{ height: 'calc(100vh - 160px)', minHeight: '500px' }}
            title={title}
            loading="lazy"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
          />
        </div>
      </div>
    </>
  );
}