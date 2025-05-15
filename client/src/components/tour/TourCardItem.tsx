import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Copy, ExternalLink, X } from 'lucide-react';
import { formatTHB } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

export interface TourCardItemProps {
  id: string;
  title: string;
  description?: string;
  price: number;
  currency: string;
  customLink: string;
  type: "tour" | "experience";
  images: string[];
}

export default function TourCardItem({ 
  title, 
  description, 
  price, 
  currency, 
  customLink, 
  type,
  images 
}: TourCardItemProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [isBookingOpen, setIsBookingOpen] = useState(false);

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
        <Card className="overflow-hidden h-full flex flex-col">
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
          </div>
          
          <CardContent className="flex flex-col flex-grow p-5">
            <h3 className="font-heading text-lg font-semibold mb-2">{title}</h3>
            
            {description && (
              <p className="text-gray-600 text-sm mb-4 line-clamp-3">{description}</p>
            )}
            
            <div className="mt-auto flex">
              <Button 
                variant={isBookingOpen ? "secondary" : "default"}
                size="sm"
                className="w-full"
                onClick={(e) => {
                  // Vérifier si l'appareil est mobile (petite résolution d'écran)
                  const isMobileDevice = window.innerWidth < 768;
                  
                  if (isMobileDevice) {
                    // Sur mobile, afficher l'iframe directement sur la page
                    setIsBookingOpen(!isBookingOpen);
                  } else {
                    // Sur PC, rediriger vers la page dédiée à l'iframe
                    e.preventDefault();
                    window.location.href = `/booking?link=${encodeURIComponent(customLink)}&title=${encodeURIComponent(title)}&type=${encodeURIComponent(type)}`;
                  }
                }}
              >
                {isBookingOpen ? (
                  <>
                    <X className="h-4 w-4 mr-1" />
                    Fermer
                  </>
                ) : (
                  <>
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Réserver
                  </>
                )}
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
                  Réservation en ligne - {type === "tour" ? "Tour" : "Expérience"}
                </p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsBookingOpen(false)}
                className="h-8 px-2 md:px-3 border-primary/30 hover:bg-primary/10 whitespace-nowrap flex-shrink-0"
              >
                <X className="h-4 w-4 md:mr-1" />
                <span className="hidden md:inline">Fermer</span>
              </Button>
            </div>
            <div className="w-full bg-white h-[calc(100vh-48px)] md:h-[calc(100vh-150px)]" style={{ minHeight: '500px' }}>
              <iframe 
                src={customLink} 
                title={`Réservation pour ${title}`}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}