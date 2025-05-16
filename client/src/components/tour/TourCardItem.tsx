import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Copy, ExternalLink, X, ChevronLeft, ChevronRight, Info } from 'lucide-react';
import { formatTHB } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

export interface TourCardItemProps {
  id: string;
  title: string;
  description?: string;
  price: number;
  currency: string;
  customLink: string;
  type: "tour" | "experience";
  images: string[];
  tags?: string[];
}

export default function TourCardItem({ 
  id,
  title, 
  description, 
  price, 
  currency, 
  customLink, 
  type,
  images,
  tags = []
}: TourCardItemProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

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

  const handleCopyLink = () => {
    navigator.clipboard.writeText(customLink).then(() => {
      setCopied(true);
      toast({
        title: 'Lien copié',
        description: 'Le lien a été copié dans votre presse-papiers',
      });
      setTimeout(() => setCopied(false), 2000);
    }).catch(err => {
      console.error('Erreur lors de la copie du lien:', err);
      toast({
        title: 'Erreur',
        description: 'Impossible de copier le lien',
        variant: 'destructive',
      });
    });
  };

  // Function to navigate the image gallery
  const navigateGallery = (direction: 'next' | 'prev') => {
    if (direction === 'next') {
      setCurrentImageIndex((prevIndex) => 
        prevIndex + 1 >= images.length ? 0 : prevIndex + 1
      );
    } else {
      setCurrentImageIndex((prevIndex) => 
        prevIndex - 1 < 0 ? images.length - 1 : prevIndex - 1
      );
    }
  };

  return (
    <div className="flex flex-col">
      <motion.div
        className="h-full"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.3 }}
        whileHover={!isBookingOpen ? { y: -5 } : {}}
      >
        <Card 
          className="overflow-hidden h-full flex flex-col cursor-pointer"
          onClick={() => setIsDetailsOpen(true)}
        >
          <div className="relative aspect-video overflow-hidden">
            {images && images.length > 0 ? (
              <img 
                src={images[0]} 
                alt={title} 
                className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-400">No image</span>
              </div>
            )}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
              <div className="flex items-center gap-2">
                <div className="inline-block px-3 py-1 rounded-full bg-primary text-white font-medium text-sm">
                  From {formatPrice(price, currency)}
                </div>
                <div className={`inline-block px-3 py-1 rounded-full font-medium text-xs ${
                  type === "tour" 
                    ? "bg-blue-600 text-white" 
                    : "bg-amber-500 text-white"
                }`}>
                  {type === "tour" ? "Tour" : "Experience"}
                </div>
              </div>
            </div>
            
            {/* Info icon to indicate clickable details */}
            <div className="absolute top-2 right-2 bg-white/80 rounded-full p-1.5">
              <Info className="h-4 w-4 text-primary" />
            </div>
          </div>
          
          <CardContent className="flex flex-col flex-grow p-5">
            <h3 className="font-heading text-lg font-semibold mb-2">{title}</h3>
            
            {description && (
              <p className="text-gray-600 text-sm mb-4 line-clamp-3">{description}</p>
            )}
            
            {/* Tag badges */}
            {tags && tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs bg-gray-50">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
            
            <div className="mt-auto flex">
              <Button 
                variant="default"
                size="sm"
                className="w-full"
                onClick={(e) => {
                  e.stopPropagation(); // Prevent triggering card click event
                  
                  // Vérifier si l'appareil est mobile (petite résolution d'écran)
                  const isMobileDevice = window.innerWidth < 768;
                  
                  if (isMobileDevice) {
                    // Sur mobile, afficher l'iframe directement sur la page
                    setIsBookingOpen(!isBookingOpen);
                  } else {
                    // Sur PC, rediriger vers la page dédiée à l'iframe
                    window.location.href = `/booking?link=${encodeURIComponent(customLink)}&title=${encodeURIComponent(title)}&type=${encodeURIComponent(type)}`;
                  }
                }}
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                Book Now
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Inline Booking iframe */}
      <AnimatePresence>
        {isBookingOpen && (
          <motion.div 
            className="fixed inset-0 z-50 bg-white md:relative md:z-auto md:w-full md:my-6 md:border-2 md:border-primary/20 md:rounded-xl md:shadow-xl md:overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <div className="bg-gradient-to-r from-primary/10 to-white p-3 md:p-4 flex items-center justify-between border-b-2 border-primary/20 sticky top-0 z-10">
              <div className="flex-1 mr-2">
                <h3 className="text-base md:text-lg font-semibold text-primary truncate">{title}</h3>
                <p className="text-xs md:text-sm text-gray-600 hidden sm:block">
                  Online booking - {type === "tour" ? "Tour" : "Experience"}
                </p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsBookingOpen(false)}
                className="h-8 px-2 md:px-3 border-primary/30 hover:bg-primary/10 whitespace-nowrap flex-shrink-0"
              >
                <X className="h-4 w-4 md:mr-1" />
                <span className="hidden md:inline">Close</span>
              </Button>
            </div>
            <div className="w-full bg-white h-[calc(100vh-48px)] md:h-[calc(100vh-150px)]" style={{ minHeight: '500px' }}>
              <iframe 
                src={customLink} 
                title={`Booking for ${title}`}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Tour Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden">
          <div className="relative bg-white rounded-lg shadow-xl overflow-hidden">
            {/* Gallery */}
            <div className="relative aspect-[16/9] overflow-hidden">
              {images && images.length > 0 ? (
                <>
                  <img 
                    src={images[currentImageIndex]} 
                    alt={`${title} image ${currentImageIndex + 1}`}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Image indicators */}
                  {images.length > 1 && (
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5">
                      {images.map((_, index) => (
                        <button
                          key={index}
                          className={`w-2 h-2 rounded-full ${
                            index === currentImageIndex 
                              ? 'bg-white' 
                              : 'bg-white/50'
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setCurrentImageIndex(index);
                          }}
                        />
                      ))}
                    </div>
                  )}
                  
                  {/* Image navigation buttons */}
                  {images.length > 1 && (
                    <>
                      <button 
                        className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/30 hover:bg-black/50 text-white"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigateGallery('prev');
                        }}
                      >
                        <ChevronLeft className="h-6 w-6" />
                      </button>
                      <button 
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/30 hover:bg-black/50 text-white"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigateGallery('next');
                        }}
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
                    From {formatPrice(price, currency)}
                  </div>
                  <div className={`inline-block px-4 py-2 rounded-full font-medium text-sm ${
                    type === "tour" 
                      ? "bg-blue-600 text-white" 
                      : "bg-amber-500 text-white"
                  }`}>
                    {type === "tour" ? "Tour" : "Experience"}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Content */}
            <div className="p-6">
              <DialogHeader>
                <DialogTitle className="text-2xl font-heading font-bold">{title}</DialogTitle>
              </DialogHeader>
              
              {/* Tags */}
              {tags && tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-4">
                  {tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs px-2.5 py-1 bg-gray-50">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
              
              {/* Description */}
              {description && (
                <DialogDescription className="mt-4 text-base">
                  {description}
                </DialogDescription>
              )}
              
              {/* Booking button */}
              <div className="mt-6">
                <Button
                  className="w-full py-6 text-base"
                  onClick={() => {
                    // Vérifier si l'appareil est mobile (petite résolution d'écran)
                    const isMobileDevice = window.innerWidth < 768;
                    
                    if (isMobileDevice) {
                      // Sur mobile, afficher l'iframe directement sur la page
                      setIsDetailsOpen(false);
                      setIsBookingOpen(true);
                    } else {
                      // Sur PC, rediriger vers la page dédiée à l'iframe
                      window.location.href = `/booking?link=${encodeURIComponent(customLink)}&title=${encodeURIComponent(title)}&type=${encodeURIComponent(type)}`;
                    }
                  }}
                >
                  <ExternalLink className="h-5 w-5 mr-2" />
                  Book Now
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}