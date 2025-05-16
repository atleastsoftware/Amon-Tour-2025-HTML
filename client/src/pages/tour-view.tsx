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
          Retour
        </Button>
        
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {/* Gallery */}
          <div className="relative aspect-[16/9] overflow-hidden">
            {tour.images && tour.images.length > 0 ? (
              <>
                <img 
                  src={tour.images[currentImageIndex]} 
                  alt={`${tour.title} image ${currentImageIndex + 1}`}
                  className="w-full h-full object-cover"
                />
                
                {/* Image indicators */}
                {tour.images.length > 1 && (
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5">
                    {tour.images.map((_: string, index: number) => (
                      <button
                        key={index}
                        className={`w-2 h-2 rounded-full ${
                          index === currentImageIndex 
                            ? 'bg-white' 
                            : 'bg-white/50'
                        }`}
                        onClick={() => setCurrentImageIndex(index)}
                      />
                    ))}
                  </div>
                )}
                
                {/* Image navigation buttons */}
                {tour.images.length > 1 && (
                  <>
                    <button 
                      className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/30 hover:bg-black/50 text-white"
                      onClick={() => navigateGallery('prev')}
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </button>
                    <button 
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/30 hover:bg-black/50 text-white"
                      onClick={() => navigateGallery('next')}
                    >
                      <ChevronRight className="h-6 w-6" />
                    </button>
                  </>
                )}
              </>
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-400">No images available</span>
              </div>
            )}
            
            {/* Price and type badges */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
              <div className="flex items-center gap-2 flex-wrap">
                <div className="inline-block px-4 py-2 rounded-full bg-primary text-white font-medium text-base">
                  From {formatPrice(tour.price, tour.currency)}
                </div>
                <div className={`inline-block px-4 py-2 rounded-full font-medium text-sm ${
                  tour.type === "tour" 
                    ? "bg-blue-600 text-white" 
                    : "bg-amber-500 text-white"
                }`}>
                  {tour.type === "tour" ? "Tour" : "Experience"}
                </div>
              </div>
            </div>
          </div>
          
          {/* Content */}
          <div className="p-6">
            <h1 className="text-2xl font-heading font-bold">{tour.title}</h1>
            
            {/* Tags */}
            {tour.tags && tour.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-4">
                {tour.tags.map((tag: string, index: number) => (
                  <Badge key={index} variant="outline" className="text-xs px-2.5 py-1 bg-gray-50">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
            
            {/* Description */}
            {tour.description && (
              <div className="mt-4 text-base">
                <p className="text-gray-700">{tour.description}</p>
              </div>
            )}
            
            {/* Booking button */}
            <div className="mt-6">
              <Button
                className="w-full py-6 text-base"
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