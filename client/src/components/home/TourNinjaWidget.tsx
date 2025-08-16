import React from 'react';

interface TourNinjaWidgetProps {
  className?: string;
}

export default function TourNinjaWidget({ className }: TourNinjaWidgetProps) {
  return (
    <div className={`tour-ninja-container ${className}`}>
      <div className="w-full">
        <iframe 
          src="https://www.tourninja.io/amon-tour-styled"
          width="100%" 
          height="600"
          style={{ border: 0, borderRadius: '24px' }}
          title="Tour Ninja Booking Widget"
        />
      </div>
      
      {/* Info Message */}
      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Your request will be processed immediately.</strong> Our local experts will contact you within 24-48 hours to discuss your personalized Thailand adventure.
        </p>
      </div>
    </div>
  );
}