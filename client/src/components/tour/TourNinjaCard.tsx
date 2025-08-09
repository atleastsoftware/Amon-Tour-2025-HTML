import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, ExternalLink } from "lucide-react";
import { TourNinjaTour } from "@/hooks/useTourNinja";
import { formatTHB } from "@/lib/utils";
import { useIframe } from "@/contexts/IframeContext";

interface TourNinjaCardProps {
  tour: TourNinjaTour;
  index?: number;
}

export default function TourNinjaCard({ tour, index = 0 }: TourNinjaCardProps) {
  const { openIframe } = useIframe();
  const [imageError, setImageError] = useState(false);
  
  const handleCardClick = () => {
    if (tour.presentationUrl) {
      openIframe(tour.presentationUrl, `Présentation - ${tour.name}`);
    } else if (tour.detailsUrl) {
      openIframe(tour.detailsUrl, `Détails - ${tour.name}`);
    } else if (tour.bookingUrl) {
      openIframe(tour.bookingUrl, `Réservation - ${tour.name}`);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -5 }}
      className="h-full"
      onClick={handleCardClick}
    >
      <Card className="h-full cursor-pointer hover:shadow-lg transition-shadow overflow-hidden group">
        <div className="relative">
          {!imageError && (tour.primaryImage || tour.images?.[0]) ? (
            <div className="h-48 overflow-hidden">
              <img
                src={tour.primaryImage || tour.images[0]}
                alt={tour.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onLoad={() => {
                  setImageError(false);
                  console.log(`✅ Successfully loaded presentation image for tour ${tour.name}`);
                }}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  console.warn(`❌ Failed to load presentation image for tour ${tour.name}:`, tour.primaryImage);
                  
                  // Try fallback image if available
                  if ((tour as any).fallbackImage && target.src !== (tour as any).fallbackImage) {
                    console.log(`🔄 Trying fallback image for tour ${tour.name}:`, (tour as any).fallbackImage);
                    target.src = (tour as any).fallbackImage;
                  } else {
                    setImageError(true);
                  }
                }}
              />
            </div>
          ) : (
            <div className="h-48 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-black/20"></div>
              <div className="text-white text-center p-4 relative z-10">
                <MapPin className="w-8 h-8 mx-auto mb-2" />
                <span className="text-sm font-medium">Krabi, Thailand</span>
                <div className="text-xs opacity-80 mt-1">Image de présentation</div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-transparent to-blue-800/30"></div>
            </div>
          )}
          
          <div className="absolute top-3 right-3">
            <Badge variant="secondary" className="bg-white/90 text-primary font-semibold">
              {tour.price > 0 
                ? (tour.currency === 'THB' ? formatTHB(tour.price) : `${tour.price} ${tour.currency || 'THB'}`)
                : 'Prix sur demande'
              }
            </Badge>
          </div>
        </div>

        <CardContent className="p-4 flex flex-col justify-between h-full">
          <div>
            <h3 
              className="font-heading font-semibold text-lg mb-2 line-clamp-2 cursor-pointer hover:text-blue-600 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                if (tour.presentationUrl) {
                  openIframe(tour.presentationUrl, `Présentation - ${tour.name}`);
                }
              }}
            >
              {tour.name}
            </h3>
            
            {tour.description && (
              <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                {tour.description}
              </p>
            )}
            
            <div className="flex flex-wrap gap-2 mb-3">
              {tour.location && (
                <div className="flex items-center text-xs text-gray-500">
                  <MapPin size={12} className="mr-1" />
                  {tour.location}
                </div>
              )}
              
              {tour.duration && (
                <div className="flex items-center text-xs text-gray-500">
                  <Clock size={12} className="mr-1" />
                  {tour.duration}
                </div>
              )}
            </div>
          </div>

          {(tour.bookingUrl || tour.detailsUrl) && (
            <div className="flex gap-2">
              {tour.detailsUrl && (
                <motion.button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (tour.detailsUrl) {
                      openIframe(tour.detailsUrl, `Details - ${tour.name}`);
                    }
                  }}
                  className="flex-1 bg-primary text-white py-2 px-4 rounded-md font-medium text-sm hover:bg-primary-dark transition-colors flex items-center justify-center"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  View details
                  <ExternalLink size={12} className="ml-1" />
                </motion.button>
              )}
              {tour.bookingUrl && (
                <motion.button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (tour.bookingUrl) {
                      openIframe(tour.bookingUrl, `Booking - ${tour.name}`);
                    }
                  }}
                  className="flex-1 bg-secondary text-white py-2 px-4 rounded-md font-medium text-sm hover:bg-secondary-dark transition-colors flex items-center justify-center"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Book
                </motion.button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}