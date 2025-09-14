import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      // Show after a short delay to ensure it appears on top
      setTimeout(() => setIsVisible(true), 1000);
    }

    // Hide any potential third-party cookie banners that might be in French
    const hideFrenchCookieBanners = () => {
      // Common selectors for third-party cookie consent tools
      const selectors = [
        '[class*="cookie"][class*="banner"]',
        '[class*="consent"][class*="banner"]', 
        '[id*="cookie"][id*="banner"]',
        '[id*="consent"]',
        '[class*="gdpr"]',
        '.cc-window', // CookieConsent common class
        '#cookieConsent',
        '[data-testid*="cookie"]',
        '[data-role="cookie"]'
      ];
      
      selectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
          // Hide French cookie banners by checking for French text
          if (el.textContent?.includes('privée') || 
              el.textContent?.includes('Personnaliser') ||
              el.textContent?.includes('Refuser') ||
              el.textContent?.includes('Accepter')) {
            (el as HTMLElement).style.display = 'none';
          }
        });
      });
    };

    // Run immediately and also after a delay in case content loads later
    hideFrenchCookieBanners();
    setTimeout(hideFrenchCookieBanners, 2000);
    
    // Set up observer for dynamically added content
    const observer = new MutationObserver(hideFrenchCookieBanners);
    observer.observe(document.body, { childList: true, subtree: true });
    
    return () => observer.disconnect();
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    closeDialog();
  };

  const handleReject = () => {
    localStorage.setItem('cookie-consent', 'rejected');
    closeDialog();
  };

  const handleCustomize = () => {
    // For now, just accept essential cookies
    localStorage.setItem('cookie-consent', 'essential');
    closeDialog();
  };

  const closeDialog = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsVisible(false);
      setIsClosing(false);
    }, 300);
  };

  if (!isVisible) return null;

  return (
    <div className={`fixed bottom-0 left-0 right-0 z-[9999] transition-all duration-300 ${isClosing ? 'translate-y-full opacity-0' : 'translate-y-0 opacity-100'}`} data-testid="cookie-consent-overlay">
      <div className="bg-white border-t border-gray-200 shadow-lg px-4 py-3" data-testid="cookie-consent-dialog">
        <div className="container mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-gray-900 mb-1">We Respect Your Privacy</h4>
            <p className="text-xs text-gray-600 leading-relaxed">
              This website uses cookies to enhance your browsing experience. By continuing to navigate, you accept our use of cookies.
            </p>
          </div>
          
          <div className="flex items-center gap-2 shrink-0">
            <Button 
              variant="ghost" 
              onClick={handleCustomize}
              className="text-xs px-3 py-1 h-auto"
              data-testid="button-cookie-customize"
            >
              Customize
            </Button>
            <Button 
              variant="outline" 
              onClick={handleReject}
              className="text-xs px-3 py-1 h-auto"
              data-testid="button-cookie-reject"
            >
              Reject All
            </Button>
            <Button 
              onClick={handleAccept}
              className="text-xs px-3 py-1 h-auto bg-primary hover:bg-primary/90"
              data-testid="button-cookie-accept"
            >
              Accept All
            </Button>
            <button 
              onClick={closeDialog}
              className="text-gray-400 hover:text-gray-600 ml-2"
              aria-label="Close"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}