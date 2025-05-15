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
            
            <div className="mt-auto flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1"
                onClick={handleCopyLink}
              >
                {copied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
                {copied ? 'Copié' : 'Copier le lien'}
              </Button>
              
              <Button 
                variant={isBookingOpen ? "secondary" : "default"}
                size="sm"
                className="flex-1"
                onClick={() => setIsBookingOpen(!isBookingOpen)}
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
            className="w-full my-6 border-2 border-primary/20 rounded-xl shadow-xl overflow-hidden bg-white"
            initial={{ opacity: 0, height: 0, y: -20 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -20 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
          >
            <div className="bg-gradient-to-r from-primary/10 to-white p-4 flex items-center justify-between border-b-2 border-primary/20">
              <div>
                <h3 className="text-lg font-semibold text-primary">{title}</h3>
                <p className="text-sm text-gray-600">
                  Réservation en ligne - {type === "tour" ? "Tour" : "Expérience"}
                </p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsBookingOpen(false)}
                className="h-8 px-3 border-primary/30 hover:bg-primary/10"
              >
                <X className="h-4 w-4 mr-1" />
                Fermer
              </Button>
            </div>
            <div className="w-full h-[800px] bg-white">
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