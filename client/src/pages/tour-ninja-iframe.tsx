import { useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import logoAmon from "@/assets/logo-amon.png";

export default function TourNinjaIframe() {
  const [, setLocation] = useLocation();
  const searchString = useSearch();
  
  // Parse URL parameters
  const urlParams = new URLSearchParams(searchString);
  const iframeUrl = urlParams.get('url');
  const title = urlParams.get('title') || 'Tour Details';
  const returnUrl = urlParams.get('return') || '/experiences';
  
  // Redirect if no URL provided
  useEffect(() => {
    if (!iframeUrl) {
      setLocation(returnUrl);
    }
  }, [iframeUrl, returnUrl, setLocation]);
  
  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
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
                Back
              </Button>
            </div>
          </div>
        </div>
        
        {/* Iframe Container */}
        <div className="container mx-auto px-0">
          <iframe
            src={iframeUrl}
            className="w-full border-0"
            style={{ height: 'calc(100vh - 200px)', minHeight: '600px' }}
            title={title}
            loading="lazy"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
          />
        </div>
      </div>
      
      <Footer />
    </>
  );
}