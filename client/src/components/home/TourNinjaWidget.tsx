import React from 'react';

interface TourNinjaWidgetProps {
  className?: string;
}

export default function TourNinjaWidget({ className }: TourNinjaWidgetProps) {
  React.useEffect(() => {
    // Écouter les messages du widget Tour Ninja
    const handleMessage = (event: MessageEvent) => {
      // Vérifier que le message vient du widget Tour Ninja
      if (event.origin !== 'https://www.tourninja.io') return;
      
      // Si c'est une soumission de formulaire, également l'envoyer vers notre backend
      if (event.data.type === 'tour-request-submitted') {
        console.log('Tour Ninja form submitted:', event.data.payload);
        
        // Envoyer aussi vers notre backend pour tracking
        fetch('/api/custom-tour-requests', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fullName: event.data.payload.customerName || 'Widget User',
            email: event.data.payload.customerEmail || 'widget@tourninja.io',
            phoneNumber: event.data.payload.phone || '',
            numberOfAdults: event.data.payload.adults || 2,
            numberOfKids: event.data.payload.children || 0,
            tripDates: event.data.payload.startDate || '',
            duration: event.data.payload.duration || '',
            tripTypes: event.data.payload.travelTypes || [],
            destinations: event.data.payload.destinations || [],
            message: event.data.payload.message || 'Tour Ninja Widget Request',
            status: 'new',
            interests: event.data.payload.interests || []
          })
        }).catch(error => {
          console.log('Failed to save Tour Ninja request locally:', error);
        });
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return (
    <div className={`tour-ninja-container ${className}`}>
      <div className="w-full">
        <iframe 
          src="https://www.tourninja.io/amon-tour-styled"
          width="100%" 
          height="800"
          style={{ border: 0, borderRadius: '24px' }}
          title="Tour Ninja Booking Widget"
        />
      </div>
      
      {/* Info Message */}
      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Votre demande sera traitée immédiatement par Tour Ninja.</strong> Si vous ne voyez pas votre demande dans votre dashboard Tour Ninja, contactez-nous directement.
        </p>
      </div>
    </div>
  );
}