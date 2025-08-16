import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    TourNinjaWidget: any;
  }
}

interface TourNinjaWidgetProps {
  className?: string;
}

export default function TourNinjaWidget({ className = "" }: TourNinjaWidgetProps) {
  const widgetRef = useRef<HTMLDivElement>(null);
  const scriptLoaded = useRef(false);
  const widgetInitialized = useRef(false);

  useEffect(() => {
    const initializeWidget = () => {
      if (window.TourNinjaWidget && widgetRef.current && !widgetInitialized.current) {
        try {
          new window.TourNinjaWidget('tour-ninja-widget-embedded', {
            tourName: 'Amon Tour Experience',
            primaryColor: '#1e73be', // Couleur principale du site
            language: 'en'
          });
          widgetInitialized.current = true;
          console.log('✅ Tour Ninja Widget initialized successfully');
        } catch (error) {
          console.error('❌ Error initializing Tour Ninja widget:', error);
        }
      }
    };

    if (scriptLoaded.current) {
      initializeWidget();
      return;
    }

    // Créer le script dynamiquement
    const script = document.createElement('script');
    script.src = 'https://www.tourninja.io/amon-tour-widget.html';
    script.async = true;
    script.onload = () => {
      scriptLoaded.current = true;
      console.log('✅ Tour Ninja script loaded');
      initializeWidget();
    };

    script.onerror = () => {
      console.error('❌ Error loading Tour Ninja script');
    };

    document.head.appendChild(script);

    return () => {
      // Nettoyage lors du démontage du composant
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
      scriptLoaded.current = false;
      widgetInitialized.current = false;
    };
  }, []);

  return (
    <div className={`tour-ninja-container ${className}`}>
      <div 
        id="tour-ninja-widget-embedded" 
        ref={widgetRef}
        className="min-h-[800px] w-full bg-white rounded-lg overflow-hidden"
      >
        {/* Loading State */}
        <div className="flex items-center justify-center h-96 bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Loading Tour Ninja Booking System...</p>
            <p className="text-sm text-gray-500 mt-2">
              Please wait while we load the advanced booking interface
            </p>
          </div>
        </div>
      </div>
      
      {/* Fallback Message */}
      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Having trouble loading the booking widget?</strong> You can also{' '}
          <a href="/custom-tour-form" className="text-blue-600 hover:text-blue-700 underline">
            use our alternative booking form
          </a>{' '}
          or contact us directly at{' '}
          <a href="mailto:info@amontour.com" className="text-blue-600 hover:text-blue-700 underline">
            info@amontour.com
          </a>
        </p>
      </div>
    </div>
  );
}