import { useState } from 'react';

interface TourNinjaWidgetProps {
  className?: string;
}

export default function TourNinjaWidget({ className = "" }: TourNinjaWidgetProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleIframeLoad = () => {
    setIsLoading(false);
    setHasError(false);
    console.log('✅ Tour Ninja iframe loaded successfully');
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setHasError(true);
    console.error('❌ Tour Ninja iframe failed to load');
  };

  return (
    <div className={`tour-ninja-container ${className}`}>
      {/* Iframe Container */}
      <div className="relative min-h-[800px] w-full bg-white rounded-lg overflow-hidden border border-gray-200">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 font-medium">Loading Tour Ninja Booking System...</p>
              <p className="text-sm text-gray-500 mt-2">
                Please wait while we load the advanced booking interface
              </p>
            </div>
          </div>
        )}
        
        {hasError ? (
          <div className="flex items-center justify-center h-96 bg-red-50">
            <div className="text-center">
              <div className="text-red-500 text-4xl mb-4">⚠️</div>
              <p className="text-red-600 font-medium">Unable to load Tour Ninja widget</p>
              <p className="text-sm text-red-500 mt-2">
                Please use the alternative booking form below
              </p>
            </div>
          </div>
        ) : (
          <iframe
            src="https://www.tourninja.io/amon-tour-widget.html"
            className="w-full h-[800px] border-0"
            onLoad={handleIframeLoad}
            onError={handleIframeError}
            title="Tour Ninja Booking Widget"
            sandbox="allow-scripts allow-forms allow-same-origin allow-popups"
          />
        )}
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