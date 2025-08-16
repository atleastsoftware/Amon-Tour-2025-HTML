import { useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet';

declare global {
  interface Window {
    TourNinjaWidget: any;
  }
}

export default function TourNinjaWidget() {
  const widgetRef = useRef<HTMLDivElement>(null);
  const scriptLoaded = useRef(false);

  useEffect(() => {
    if (scriptLoaded.current) return;

    // Créer le script dynamiquement
    const script = document.createElement('script');
    script.src = 'https://www.tourninja.io/amon-tour-widget.html';
    script.async = true;
    script.onload = () => {
      scriptLoaded.current = true;
      
      // Initialiser le widget une fois le script chargé
      if (window.TourNinjaWidget && widgetRef.current) {
        try {
          new window.TourNinjaWidget('tour-ninja-widget', {
            tourName: 'Amon Tour Experience',
            primaryColor: '#1e73be', // Couleur principale du site
            language: 'en'
          });
        } catch (error) {
          console.error('Erreur lors de l\'initialisation du widget Tour Ninja:', error);
        }
      }
    };

    script.onerror = () => {
      console.error('Erreur lors du chargement du script Tour Ninja');
    };

    document.head.appendChild(script);

    return () => {
      // Nettoyage lors du démontage du composant
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  return (
    <>
      <Helmet>
        <title>Tour Ninja Widget - Amon Tour</title>
        <meta name="description" content="Book your perfect Thai adventure with our advanced tour booking widget powered by Tour Ninja." />
        <meta name="keywords" content="Thailand tours, Krabi tours, tour booking, custom tours, Tour Ninja" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Advanced Tour Booking
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Discover and book your perfect Thai adventure with our comprehensive tour selection platform
              </p>
            </div>
          </div>
        </div>

        {/* Widget Container */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
              <h2 className="text-xl font-semibold mb-2">Tour Ninja Booking Widget</h2>
              <p className="text-blue-100">
                Use this advanced booking system to explore our complete tour catalog and make reservations
              </p>
            </div>
            
            {/* Widget Integration */}
            <div className="p-6">
              <div 
                id="tour-ninja-widget" 
                ref={widgetRef}
                className="min-h-[600px] w-full"
              >
                {/* Loading State */}
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading Tour Ninja Widget...</p>
                    <p className="text-sm text-gray-500 mt-2">
                      If the widget doesn't load, please check your internet connection.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Fallback Information */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">
              Alternative Booking Methods
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Custom Tour Request</h4>
                <p className="text-gray-600 text-sm mb-3">
                  Create a personalized tour experience tailored to your preferences
                </p>
                <a 
                  href="/custom-tour" 
                  className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium text-sm"
                >
                  Create Custom Tour →
                </a>
              </div>
              <div className="bg-white p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Browse Our Tours</h4>
                <p className="text-gray-600 text-sm mb-3">
                  Explore our curated selection of authentic Thai experiences
                </p>
                <a 
                  href="/tours" 
                  className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium text-sm"
                >
                  View All Tours →
                </a>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Need assistance? Contact us at{' '}
              <a href="mailto:info@amontour.com" className="text-blue-600 hover:text-blue-700">
                info@amontour.com
              </a>
              {' '}or{' '}
              <a href="tel:+66123456789" className="text-blue-600 hover:text-blue-700">
                +66 123 456 789
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}