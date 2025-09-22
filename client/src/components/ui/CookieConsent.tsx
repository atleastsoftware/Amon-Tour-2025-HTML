import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
export default function CookieConsent() {
  const { t } = useTranslation();
  const {
    t
  } = useTranslation();
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
      // Function to hide French cookie banners in any context (main page or iframe)
      const hideInContext = (doc: Document) => {
        // Common selectors for third-party cookie consent tools
        const selectors = ['[class*="cookie"]', '[class*="consent"]', '[id*="cookie"]', '[id*="consent"]', '[class*="gdpr"]', '.cc-window', '#cookieConsent', '[data-testid*="cookie"]', '[data-role="cookie"]', 'div[style*="z-index"]:has-text("privée")', 'div[style*="z-index"]:has-text("Personnaliser")'];
        selectors.forEach(selector => {
          try {
            const elements = doc.querySelectorAll(selector);
            elements.forEach(el => {
              const text = el.textContent?.toLowerCase() || '';
              // Check for French cookie consent terms
              if (text.includes('privée') || text.includes('personnaliser') || text.includes('refuser') || text.includes('accepter tout') || text.includes('nous respectons') || text.includes('vie privée') || text.includes('navigation')) {
                (el as HTMLElement).style.display = 'none';
                console.log('Hidden French cookie banner:', el);
              }
            });
          } catch (e) {
            // Ignore errors for invalid selectors
          }
        });

        // Also check all high z-index divs that might be cookie banners
        const highZElements = doc.querySelectorAll('div[style*="z-index"]');
        highZElements.forEach(el => {
          const text = el.textContent?.toLowerCase() || '';
          const style = (el as HTMLElement).style.zIndex;
          if (parseInt(style) > 1000 && (text.includes('privée') || text.includes('personnaliser') || text.includes('refuser') || text.includes('accepter tout'))) {
            (el as HTMLElement).style.display = 'none';
            console.log('Hidden high z-index French element:', el);
          }
        });
      };

      // Hide in main document
      hideInContext(document);

      // Also check in iframes
      try {
        const iframes = document.querySelectorAll('iframe');
        iframes.forEach(iframe => {
          try {
            if (iframe.contentDocument) {
              hideInContext(iframe.contentDocument);
            }
          } catch (e) {
            // Cross-origin iframe, can't access
          }
        });
      } catch (e) {
        // Ignore iframe access errors
      }
    };

    // Run immediately and also after delays in case content loads later
    hideFrenchCookieBanners();
    setTimeout(hideFrenchCookieBanners, 1000);
    setTimeout(hideFrenchCookieBanners, 3000);
    setTimeout(hideFrenchCookieBanners, 5000);

    // Set up observer for dynamically added content
    const observer = new MutationObserver(mutations => {
      // Check if any added nodes might be cookie dialogs
      let shouldCheck = false;
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === 1) {
            // Element node
            const element = node as Element;
            const text = element.textContent?.toLowerCase() || '';
            if (text.includes('cookie') || text.includes('consent') || text.includes('privée') || text.includes('personnaliser')) {
              shouldCheck = true;
            }
          }
        });
      });
      if (shouldCheck) {
        setTimeout(hideFrenchCookieBanners, 100);
      }
    });
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Also listen for iframe load events
    window.addEventListener('message', event => {
      // Check if message is from iframe that might contain cookie consent
      if (typeof event.data === 'string' && (event.data.includes('cookie') || event.data.includes('consent'))) {
        setTimeout(hideFrenchCookieBanners, 500);
      }
    });
    return () => {
      observer.disconnect();
      window.removeEventListener('message', hideFrenchCookieBanners);
    };
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
  return <div className={`fixed bottom-0 left-0 right-0 z-[9999] transition-all duration-300 ${isClosing ? 'translate-y-full opacity-0' : 'translate-y-0 opacity-100'}`} data-testid="cookie-consent-overlay">
      <div className="bg-white border-t border-gray-200 shadow-lg px-4 py-3" data-testid="cookie-consent-dialog">
        <div className="container mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-gray-900 mb-1">{t('cookies.privacyTitle')}</h4>
            <p className="text-xs text-gray-600 leading-relaxed">
              {t('cookies.privacyMessage')}
            </p>
          </div>
          
          <div className="flex items-center gap-2 shrink-0">
            <Button variant="ghost" onClick={handleCustomize} className="text-xs px-3 py-1 h-auto" data-testid="button-cookie-customize">{t('Customize', {
              defaultValue: 'Customize'
            })}</Button>
            <Button variant="outline" onClick={handleReject} className="text-xs px-3 py-1 h-auto" data-testid="button-cookie-reject">{t('Reject All', {
              defaultValue: 'Reject All'
            })}</Button>
            <Button onClick={handleAccept} className="text-xs px-3 py-1 h-auto bg-primary hover:bg-primary/90" data-testid="button-cookie-accept">{t('Accept All', {
              defaultValue: 'Accept All'
            })}</Button>
            <button onClick={closeDialog} className="text-gray-400 hover:text-gray-600 ml-2" aria-label={t('Close', {
            defaultValue: 'Close'
          })}>
              <X size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>;
}