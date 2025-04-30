import { Link } from "wouter";
import { Tour } from "@shared/schema";

interface TourCardProps {
  tour: Tour;
}

export default function TourCard({ tour }: TourCardProps) {
  return (
    <div className="tour-card bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
      <div className="h-56 overflow-hidden">
        <img 
          src={tour.imageUrl} 
          alt={tour.title} 
          className="w-full h-full object-cover transition-transform hover:scale-105 duration-500"
        />
      </div>
      <div className="p-6">
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-heading font-bold text-xl">{tour.title}</h3>
          <span className="bg-primary-light text-white px-2 py-1 rounded text-sm">{tour.duration}</span>
        </div>
        <p className="text-gray-600 mb-4">{tour.shortDescription}</p>
        <div className="flex justify-between items-center mb-4">
          <span className="font-heading font-bold text-lg text-primary">From {new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(tour.price)}</span>
          <Link href={`/tours/${tour.id}`}>
            <span className="text-secondary font-semibold hover:text-secondary-dark transition-colors cursor-pointer">
              View details →
            </span>
          </Link>
        </div>
        <div className="flex justify-between items-center">
          <a 
            href={tour.tourNinjaUrl} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="w-full bg-secondary text-white py-2 px-4 rounded text-center block hover:bg-secondary-dark transition-colors"
          >
            Book Now
          </a>
        </div>
      </div>
    </div>
  );
}
