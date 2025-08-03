import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, ExternalLink } from "lucide-react";
import { TourNinjaTour } from "@/hooks/useTourNinja";
import { formatTHB } from "@/lib/utils";

interface TourNinjaCardProps {
  tour: TourNinjaTour;
  index?: number;
}

export default function TourNinjaCard({ tour, index = 0 }: TourNinjaCardProps) {
  const handleCardClick = () => {
    if (tour.presentationUrl) {
      window.open(tour.presentationUrl, '_blank', 'noopener,noreferrer');
    } else if (tour.detailsUrl) {
      window.open(tour.detailsUrl, '_blank', 'noopener,noreferrer');
    } else if (tour.bookingUrl) {
      window.open(tour.bookingUrl, '_blank', 'noopener,noreferrer');
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
          {(tour.primaryImage || tour.images?.[0]) ? (
            <div className="h-48 overflow-hidden">
              <img
                src={tour.primaryImage || tour.images[0]}
                alt={tour.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            </div>
          ) : (
            <div className="h-48 bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
              <div className="text-blue-600 text-center p-4">
                <MapPin className="w-8 h-8 mx-auto mb-2" />
                <span className="text-sm">Krabi, Thailand</span>
              </div>
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
                  window.open(tour.presentationUrl, '_blank', 'noopener,noreferrer');
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
                    window.open(tour.detailsUrl, '_blank', 'noopener,noreferrer');
                  }}
                  className="flex-1 bg-primary text-white py-2 px-4 rounded-md font-medium text-sm hover:bg-primary-dark transition-colors flex items-center justify-center"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Voir détails
                  <ExternalLink size={12} className="ml-1" />
                </motion.button>
              )}
              {tour.bookingUrl && (
                <motion.button
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(tour.bookingUrl, '_blank', 'noopener,noreferrer');
                  }}
                  className="flex-1 bg-secondary text-white py-2 px-4 rounded-md font-medium text-sm hover:bg-secondary-dark transition-colors flex items-center justify-center"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Réserver
                </motion.button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}