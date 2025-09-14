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
    <div className={`fixed inset-0 bg-black/50 flex items-end justify-center z-[9999] transition-opacity duration-300 ${isClosing ? 'opacity-0' : 'opacity-100'}`} data-testid="cookie-consent-overlay">
      <div className={`bg-white rounded-t-lg shadow-lg max-w-2xl mx-4 mb-0 p-6 transform transition-transform duration-300 ${isClosing ? 'translate-y-full' : 'translate-y-0'}`} data-testid="cookie-consent-dialog">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-heading font-semibold text-gray-900">
            We Respect Your Privacy
          </h3>
          <button 
            onClick={closeDialog}
            className="text-gray-400 hover:text-gray-600 ml-4"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>
        
        <p className="text-gray-600 mb-6 leading-relaxed">
          This website uses cookies to enhance your browsing experience. By continuing to navigate, 
          you accept our use of cookies to provide you with the best possible experience.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-end">
          <Button 
            variant="outline" 
            onClick={handleCustomize}
            className="text-sm"
            data-testid="button-cookie-customize"
          >
            Customize
          </Button>
          <Button 
            variant="outline" 
            onClick={handleReject}
            className="text-sm"
            data-testid="button-cookie-reject"
          >
            Reject All
          </Button>
          <Button 
            onClick={handleAccept}
            className="text-sm bg-primary hover:bg-primary/90"
            data-testid="button-cookie-accept"
          >
            Accept All
          </Button>
        </div>
      </div>
    </div>
  );
}