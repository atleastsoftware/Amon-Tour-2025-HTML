import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Copy, ExternalLink, X } from 'lucide-react';
import { formatTHB } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';

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
        return new Intl.NumberFormat('fr-FR', {
          style: 'currency',
          currency: 'EUR'
        }).format(price);
      case 'USD':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD'
        }).format(price);
      default:
        return `${price} ${currency}`;
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(customLink);
    setCopied(true);
    toast({
      description: "Lien copié dans le presse-papier!",
    });
    
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return (
    <>
      <motion.div 
        whileHover={{ y: -5, transition: { duration: 0.2 } }}
        className="h-full"
      >
        <Card className="shadow-md overflow-hidden h-full flex flex-col">
          <div className="relative h-48 overflow-hidden bg-gray-100">
            {images && images.length > 0 ? (
              <img 
                src={images[0]} 
                alt={title} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-gray-400">
                <span>Aucune image</span>
              </div>
            )}
            
            <div className="absolute top-2 right-2 bg-white py-1 px-2 rounded-md shadow-sm text-xs font-medium">
              {type === "experience" ? "Expérience" : "Tour"}
            </div>
          </div>
          
          <CardContent className="flex-1 flex flex-col p-4">
            <div className="flex-1">
              <h3 className="font-heading font-semibold text-lg mb-1 line-clamp-2">{title}</h3>
              
              {description && (
                <p className="text-sm text-gray-600 line-clamp-3 mb-3">
                  {description}
                </p>
              )}
              
              <div className="mt-auto">
                <p className="text-lg font-semibold text-primary mb-3">
                  À partir de {formatPrice(price, currency)}
                </p>
              </div>
            </div>
            
            <div className="flex gap-2 mt-4">
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
                variant="default" 
                size="sm"
                className="flex-1"
                onClick={() => setIsBookingOpen(true)}
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                Réserver
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Booking Modal with iframe */}
      <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
        <DialogContent className="max-w-4xl h-[80vh] sm:max-h-[85vh] p-0">
          <div className="px-6 pt-6 pb-2 flex flex-row items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">{title}</h2>
              <p className="text-sm text-gray-500">
                Réservez directement votre {type === "tour" ? "tour" : "expérience"}
              </p>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsBookingOpen(false)}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex-1 overflow-hidden p-0 h-full">
            <iframe 
              src={customLink} 
              title={`Réservation pour ${title}`}
              className="w-full h-full border-0"
              style={{ height: 'calc(80vh - 90px)' }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}