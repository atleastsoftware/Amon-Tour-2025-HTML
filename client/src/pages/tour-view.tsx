import { useEffect, useState } from 'react';
import { useLocation, Link } from 'wouter';
import Footer from '@/components/layout/Footer';
import Header from '@/components/layout/Header';
import HeaderSimple from '@/components/layout/HeaderSimple';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { formatTHB } from '@/lib/utils';

export default function TourView() {
  const [, setLocation] = useLocation();
  const [tour, setTour] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    // Récupérer les paramètres de l'URL
    const params = new URLSearchParams(window.location.search);
    const tourData = params.get('tourData');

    if (!tourData) {
      // Si pas de données de tour, on redirige vers la page des tours
      setLocation('/tours');
      return;
    }

    try {
      // Décodage des données du tour depuis l'URL
      const decodedData = JSON.parse(decodeURIComponent(tourData));
      setTour(decodedData);
    } catch (error) {
      console.error("Erreur lors du décodage des données du tour:", error);
      setLocation('/tours');
      return;
    }
    
    // Simule un petit délai de chargement pour une meilleure transition
    setTimeout(() => {
      setIsLoading(false);
    }, 300);
  }, [setLocation]);

  // Navigation dans la galerie d'images
  const navigateGallery = (direction: 'next' | 'prev') => {
    if (!tour || !tour.images || tour.images.length <= 1) return;
    
    if (direction === 'next') {
      setCurrentImageIndex((prevIndex) => 
        prevIndex + 1 >= tour.images.length ? 0 : prevIndex + 1
      );
    } else {
      setCurrentImageIndex((prevIndex) => 
        prevIndex - 1 < 0 ? tour.images.length - 1 : prevIndex - 1
      );
    }
  };
  
  // Formatage du prix selon la devise
  const formatPrice = (price: number, currency: string) => {
    switch (currency) {
      case 'THB':
        return formatTHB(price);
      case 'EUR':
        return `€${price}`;
      case 'USD':
        return `$${price}`;
      default:
        return `${price} ${currency}`;
    }
  };

  if (isLoading || !tour) {
    return (
      <>
        <HeaderSimple />
        <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-[60vh]">
          <div className="animate-pulse">
            <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-gray-400">Loading...</span>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <HeaderSimple />
      
      <main className="container mx-auto px-4 py-8">
        <Button
          variant="outline"
          className="mb-6 flex items-center"
          onClick={() => window.history.back()}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        
        <div className="bg-white rounded-xl shadow-md overflow-hidden max-w-5xl mx-auto">
          {/* Tour Title */}
          <div className="p-6 pb-0">
            <h1 className="text-3xl font-heading font-bold">{tour.title}</h1>
            
            {/* Tour info badges */}
            <div className="flex flex-wrap items-center gap-4 mt-3 text-gray-700">
              <div className="flex items-center gap-1">
                <span className="inline-flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-1">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                  2 Days / 1 Night
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className="inline-flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-1">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
                  </svg>
                  Private packaged journey
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className="inline-flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-1">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
                  </svg>
                  Ideal for couples / families / small groups
                </span>
              </div>
            </div>
          </div>
          
          {/* Gallery - Style inspiré de l'image de référence */}
          <div className="p-6">
            <div className="grid grid-cols-4 gap-2 rounded-lg overflow-hidden">
              {tour.images && tour.images.length > 0 ? (
                <>
                  {/* Image principale (plus grande) */}
                  <div className="col-span-2 row-span-2 relative">
                    <img 
                      src={tour.images[0]} 
                      alt={`${tour.title} main image`}
                      className="w-full h-full object-cover aspect-[4/3]"
                    />
                    <div className="absolute bottom-0 left-0 right-0 flex justify-between p-3">
                      <div className="inline-block px-3 py-1 rounded-full bg-white/80 text-black font-medium text-sm">
                        From {formatPrice(tour.price, tour.currency)}
                      </div>
                      <div className={`inline-block px-3 py-1 rounded-full font-medium text-xs ${
                        tour.type === "tour" 
                          ? "bg-blue-600 text-white" 
                          : "bg-amber-500 text-white"
                      }`}>
                        {tour.type === "tour" ? "Tour" : "Experience"}
                      </div>
                    </div>
                  </div>
                  
                  {/* Images secondaires */}
                  {tour.images.slice(1, 5).map((image: string, index: number) => (
                    <div key={index + 1} className="col-span-1 row-span-1 overflow-hidden">
                      <img 
                        src={image} 
                        alt={`${tour.title} image ${index + 2}`}
                        className="w-full h-full object-cover aspect-square"
                      />
                    </div>
                  ))}
                  
                  {/* Si moins de 5 images, ajouter des placeholders */}
                  {Array.from({ length: Math.max(0, 5 - tour.images.length) }).map((_, index) => (
                    <div key={`placeholder-${index}`} className="col-span-1 row-span-1 bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-400 text-xs">No image</span>
                    </div>
                  ))}
                </>
              ) : (
                // Placeholder si aucune image
                <div className="col-span-4 aspect-[16/9] bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400">No images available</span>
                </div>
              )}
            </div>
            
            {/* Gallery controls */}
            <div className="flex justify-center gap-4 mt-4">
              <button className="flex items-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-1">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                </svg>
                Gallery
              </button>
              
              <button className="flex items-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-1">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
                </svg>
                Video
              </button>
            </div>
          </div>
          
          {/* Content */}
          <div className="p-6">
            <h2 className="text-2xl font-heading font-bold">Tour Description</h2>
            
            {/* Description */}
            {tour.description && (
              <div className="mt-4">
                <p className="text-gray-700 whitespace-pre-line mb-8">{tour.description}</p>
              </div>
            )}
            
            {/* Tour Highlights */}
            <h3 className="font-heading font-semibold text-xl mb-3">Tour Highlights</h3>
            <div className="flex flex-col gap-3 mb-8">
              {tour.description ? 
                tour.description.split('.').slice(0, 4).map((point: string, index: number) => (
                  point.trim() && (
                    <div key={index} className="flex items-start">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-primary mt-0.5 mr-2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                      </svg>
                      <span className="text-gray-700">{point.trim()}.</span>
                    </div>
                  )
                )) : 
                <div className="text-gray-500 italic">No highlights available</div>
              }
            </div>
            
            {/* Tags */}
            {tour.tags && tour.tags.length > 0 && (
              <div className="mb-8">
                <h3 className="font-heading font-semibold text-xl mb-3">Locations</h3>
                <div className="flex flex-wrap gap-2">
                  {tour.tags.map((tag: string, index: number) => (
                    <Badge key={index} variant="outline" className="text-sm px-3 py-1.5 bg-gray-50">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            {/* Price section */}
            <div className="mt-8 bg-gray-50 p-6 rounded-lg">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-heading font-semibold text-xl">Price</h3>
                <span className="text-2xl font-heading font-bold text-primary">
                  From {formatPrice(tour.price, tour.currency)}
                </span>
              </div>
              
              {/* Booking button */}
              <Button
                className="w-full py-6 text-base mt-4"
                onClick={() => {
                  window.location.href = `/booking?link=${encodeURIComponent(tour.customLink)}&title=${encodeURIComponent(tour.title)}&type=${encodeURIComponent(tour.type)}`;
                }}
              >
                <ExternalLink className="h-5 w-5 mr-2" />
                Book Now
              </Button>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </>
  );
}